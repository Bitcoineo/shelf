import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

type StripeProductResult = {
  stripeProductId: string;
  stripePriceId: string;
};

export async function createStripeProduct(
  name: string,
  description: string,
  priceInCents: number
): Promise<{ data?: StripeProductResult; error?: string }> {
  try {
    const stripe = getStripe();

    const product = await stripe.products.create({ name, description });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInCents,
      currency: "usd",
    });

    return {
      data: {
        stripeProductId: product.id,
        stripePriceId: price.id,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    return { error: message };
  }
}
