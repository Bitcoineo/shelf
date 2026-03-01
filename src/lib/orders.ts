import { eq, sql, inArray } from "drizzle-orm";
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
