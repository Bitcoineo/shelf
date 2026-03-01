import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { completeOrder } from "@/lib/orders";
import { createDownload } from "@/lib/downloads";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    const body = await request.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!orderId) {
      console.error("No orderId in session metadata");
      return NextResponse.json(
        { error: "Missing orderId in metadata" },
        { status: 400 }
      );
    }

    if (!paymentIntent) {
      console.error("No payment_intent on session");
      return NextResponse.json(
        { error: "Missing payment intent" },
        { status: 400 }
      );
    }

    const orderResult = await completeOrder(orderId, paymentIntent);
    if (orderResult.error) {
      console.error("Failed to complete order:", orderResult.error);
      return NextResponse.json(
        { error: orderResult.error },
        { status: 500 }
      );
    }

    const downloadResult = await createDownload(orderId);
    if (downloadResult.error) {
      console.error("Failed to create download:", downloadResult.error);
      return NextResponse.json(
        { error: downloadResult.error },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
