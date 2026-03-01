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

export async function updateStripeProduct(input: {
  stripeProductId: string;
  name: string;
  description: string;
  currentStripePriceId: string;
  newPriceInCents: number | null;
}): Promise<{ data?: { stripePriceId: string }; error?: string }> {
  try {
    const stripe = getStripe();

    await stripe.products.update(input.stripeProductId, {
      name: input.name,
      description: input.description,
    });

    if (input.newPriceInCents !== null) {
      const newPrice = await stripe.prices.create({
        product: input.stripeProductId,
        unit_amount: input.newPriceInCents,
        currency: "usd",
      });

      // Archive old price (non-critical — don't fail if this errors)
      try {
        await stripe.prices.update(input.currentStripePriceId, {
          active: false,
        });
      } catch {
        // Old price stays active — harmless
      }

      return { data: { stripePriceId: newPrice.id } };
    }

    return { data: { stripePriceId: input.currentStripePriceId } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    return { error: message };
  }
}

export async function deactivateStripeProduct(
  stripeProductId: string,
  stripePriceId: string | null
): Promise<{ error?: string }> {
  try {
    const stripe = getStripe();

    if (stripePriceId) {
      await stripe.prices.update(stripePriceId, { active: false });
    }
    await stripe.products.update(stripeProductId, { active: false });

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    return { error: message };
  }
}
