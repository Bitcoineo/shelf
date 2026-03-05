import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createProduct } from "@/lib/products";
import { validateProductBody } from "./validate";

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

  const parsed = validateProductBody(body);
  if (parsed.error) return parsed.error;

  const result = await createProduct(parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");

  return NextResponse.json({ data: result.data }, { status: 201 });
}
