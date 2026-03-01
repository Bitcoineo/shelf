import { eq, sql, inArray, desc, and, like } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, products } from "@/db/schema";

type Order = typeof orders.$inferSelect;

export async function getOrderById(
  id: string
): Promise<{
  data?: { order: Order; productName: string } | null;
  error?: string;
}> {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        order: orders,
        productName: products.name,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, id))
      .limit(1);

    return { data: row ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getOrderCountsByProductIds(
  productIds: string[]
): Promise<{ data?: Record<string, number>; error?: string }> {
  if (productIds.length === 0) return { data: {} };

  try {
    const db = getDb();
    const rows = await db
      .select({
        productId: orders.productId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(orders)
      .where(inArray(orders.productId, productIds))
      .groupBy(orders.productId);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.productId] = row.count;
    }
    return { data: counts };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getOrderBySessionId(
  stripeSessionId: string
): Promise<{ data?: Order | null; error?: string }> {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, stripeSessionId))
      .limit(1);

    return { data: order ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function completeOrder(
  orderId: string,
  paymentIntent: string
): Promise<{ data?: Order; error?: string }> {
  try {
    const db = getDb();
    const [updated] = await db
      .update(orders)
      .set({ status: "completed", stripePaymentIntent: paymentIntent })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) {
      return { error: "Order not found" };
    }

    return { data: updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

// ─── Admin Queries ──────────────────────────────────────────────────────────

type OrderWithProduct = Order & {
  productName: string;
  priceInCents: number;
  productId: string;
};

export async function getAllOrders(
  filter?: string,
  search?: string
): Promise<{ data?: OrderWithProduct[]; error?: string }> {
  try {
    const db = getDb();

    const conditions = [];
    if (filter && filter !== "all") {
      conditions.push(eq(orders.status, filter as "pending" | "completed" | "failed"));
    }
    if (search && search.trim()) {
      conditions.push(like(orders.customerEmail, `%${search.trim()}%`));
    }

    const rows = await db
      .select({
        id: orders.id,
        productId: orders.productId,
        customerEmail: orders.customerEmail,
        stripeSessionId: orders.stripeSessionId,
        stripePaymentIntent: orders.stripePaymentIntent,
        status: orders.status,
        createdAt: orders.createdAt,
        productName: products.name,
        priceInCents: products.priceInCents,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    return { data: rows as OrderWithProduct[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getOrderStats(): Promise<{
  data?: { totalRevenue: number; totalOrders: number; totalProducts: number };
  error?: string;
}> {
  try {
    const db = getDb();

    const [revenueRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${products.priceInCents}), 0)`.as("total"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.status, "completed"));

    const [productRow] = await db
      .select({
        count: sql<number>`count(*)`.as("count"),
      })
      .from(products)
      .where(eq(products.isActive, 1));

    return {
      data: {
        totalRevenue: revenueRow?.total ?? 0,
        totalOrders: revenueRow?.count ?? 0,
        totalProducts: productRow?.count ?? 0,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getRevenueByDay(
  days = 30
): Promise<{ data?: { date: string; revenue: number }[]; error?: string }> {
  try {
    const db = getDb();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({
        date: sql<string>`date(${orders.createdAt} / 1000, 'unixepoch')`.as("date"),
        revenue: sql<number>`coalesce(sum(${products.priceInCents}), 0)`.as("revenue"),
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(
        and(
          eq(orders.status, "completed"),
          sql`${orders.createdAt} >= ${since.getTime()}`
        )
      )
      .groupBy(sql`date(${orders.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${orders.createdAt} / 1000, 'unixepoch')`);

    // Fill missing days with 0
    const revenueMap = new Map(rows.map((r) => [r.date, r.revenue]));
    const result: { date: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      result.push({ date: key, revenue: revenueMap.get(key) ?? 0 });
    }

    return { data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getTopProducts(
  limit = 5
): Promise<{
  data?: { name: string; orderCount: number; revenue: number }[];
  error?: string;
}> {
  try {
    const db = getDb();

    const rows = await db
      .select({
        name: products.name,
        orderCount: sql<number>`count(*)`.as("order_count"),
        revenue: sql<number>`coalesce(sum(${products.priceInCents}), 0)`.as("revenue"),
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.status, "completed"))
      .groupBy(products.id)
      .orderBy(sql`count(*) desc`)
      .limit(limit);

    return { data: rows };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}
