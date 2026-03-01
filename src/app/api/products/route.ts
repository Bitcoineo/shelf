import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createProduct } from "@/lib/products";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, priceInCents, fileUrl, previewImageUrl } =
    body as Record<string, unknown>;

  if (typeof name !== "string") {
    return NextResponse.json({ error: "name must be a string" }, { status: 400 });
  }
  if (typeof description !== "string") {
    return NextResponse.json({ error: "description must be a string" }, { status: 400 });
  }
  if (typeof priceInCents !== "number" || !Number.isInteger(priceInCents)) {
    return NextResponse.json({ error: "priceInCents must be an integer" }, { status: 400 });
  }
  if (typeof fileUrl !== "string") {
    return NextResponse.json({ error: "fileUrl must be a string" }, { status: 400 });
  }

  const result = await createProduct({
    name,
    description,
    priceInCents,
    fileUrl,
    previewImageUrl: typeof previewImageUrl === "string" ? previewImageUrl : null,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");

  return NextResponse.json({ data: result.data }, { status: 201 });
}
