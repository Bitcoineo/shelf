import { nanoid } from "nanoid";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { getProductById } from "./products";
import { getStripe } from "./stripe";

export async function createCheckoutSession(
  productId: string,
  customerEmail: string
): Promise<{ data?: { checkoutUrl: string }; error?: string }> {
  const productResult = await getProductById(productId);
  if (productResult.error) {
    return { error: productResult.error };
  }
  if (!productResult.data) {
    return { error: "Product not found" };
  }

  const product = productResult.data;

  if (!product.isActive) {
    return { error: "Product is no longer available" };
  }
  if (!product.stripePriceId) {
    return { error: "Product is not configured for payment" };
  }

  const orderId = nanoid();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: `${baseUrl}/order/success?order_id=${orderId}`,
      cancel_url: baseUrl,
      metadata: { productId, orderId },
    });

    if (!session.url) {
      return { error: "Failed to create checkout session" };
    }

    const db = getDb();
    await db.insert(orders).values({
      id: orderId,
      productId,
      customerEmail,
      stripeSessionId: session.id,
      status: "pending",
      createdAt: new Date(),
    });

    return { data: { checkoutUrl: session.url } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    return { error: message };
  }
}
