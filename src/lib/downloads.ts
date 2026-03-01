import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { downloads, orders, products } from "@/db/schema";

type Download = typeof downloads.$inferSelect;

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export async function createDownload(
  orderId: string
): Promise<{ data?: Download; error?: string }> {
  try {
    const db = getDb();
    const [download] = await db
      .insert(downloads)
      .values({
        id: nanoid(),
        orderId,
        token: nanoid(),
        expiresAt: new Date(Date.now() + FORTY_EIGHT_HOURS_MS),
        downloadCount: 0,
        maxDownloads: 3,
        createdAt: new Date(),
      })
      .returning();

    return { data: download };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getDownloadByOrderId(
  orderId: string
): Promise<{ data?: Download | null; error?: string }> {
  try {
    const db = getDb();
    const [download] = await db
      .select()
      .from(downloads)
      .where(eq(downloads.orderId, orderId))
      .limit(1);

    return { data: download ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getDownloadByToken(token: string): Promise<{
  data?: {
    download: Download;
    fileUrl: string;
  } | null;
  error?: string;
}> {
  try {
    const db = getDb();
    const [row] = await db
      .select({
        download: downloads,
        fileUrl: products.fileUrl,
      })
      .from(downloads)
      .innerJoin(orders, eq(downloads.orderId, orders.id))
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(downloads.token, token))
      .limit(1);

    return { data: row ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function incrementDownloadCount(
  downloadId: string
): Promise<{ error?: string }> {
  try {
    const db = getDb();
    await db
      .update(downloads)
      .set({ downloadCount: sql`${downloads.downloadCount} + 1` })
      .where(eq(downloads.id, downloadId));

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}
