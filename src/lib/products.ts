import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { createStripeProduct } from "./stripe";

type CreateProductInput = {
  name: string;
  description: string;
  priceInCents: number;
  fileUrl: string;
  previewImageUrl?: string | null;
};

type Product = typeof products.$inferSelect;

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createProduct(
  input: CreateProductInput
): Promise<{ data?: Product; error?: string }> {
  if (!input.name.trim()) {
    return { error: "Name is required" };
  }
  if (!input.description.trim()) {
    return { error: "Description is required" };
  }
  if (!Number.isInteger(input.priceInCents) || input.priceInCents < 0) {
    return { error: "Price must be a non-negative integer (cents)" };
  }
  if (!input.fileUrl.trim()) {
    return { error: "File URL is required" };
  }

  const stripeResult = await createStripeProduct(
    input.name.trim(),
    input.description.trim(),
    input.priceInCents
  );

  if (stripeResult.error) {
    return { error: `Stripe: ${stripeResult.error}` };
  }

  try {
    const db = getDb();
    const now = new Date();

    const [product] = await db
      .insert(products)
      .values({
        id: nanoid(),
        name: input.name.trim(),
        description: input.description.trim(),
        priceInCents: input.priceInCents,
        fileUrl: input.fileUrl.trim(),
        previewImageUrl: input.previewImageUrl?.trim() || null,
        stripeProductId: stripeResult.data!.stripeProductId,
        stripePriceId: stripeResult.data!.stripePriceId,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return { data: product };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getActiveProducts(): Promise<{
  data?: Product[];
  error?: string;
}> {
  try {
    const db = getDb();
    const result = await db
      .select()
      .from(products)
      .where(eq(products.isActive, 1))
      .orderBy(desc(products.createdAt));

    return { data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}

export async function getProductById(
  id: string
): Promise<{ data?: Product | null; error?: string }> {
  try {
    const db = getDb();
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return { data: product ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { error: message };
  }
}
