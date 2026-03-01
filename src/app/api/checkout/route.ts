import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/checkout";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, email } = body as Record<string, unknown>;

  if (typeof productId !== "string" || !productId.trim()) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const result = await createCheckoutSession(productId.trim(), email.trim());

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ url: result.data!.checkoutUrl });
}
