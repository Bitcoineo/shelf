import { NextResponse } from "next/server";

export function validateProductBody(body: unknown) {
  const { name, description, priceInCents, fileUrl, previewImageUrl } =
    body as Record<string, unknown>;

  if (typeof name !== "string") {
    return { error: NextResponse.json({ error: "name must be a string" }, { status: 400 }) };
  }
  if (typeof description !== "string") {
    return { error: NextResponse.json({ error: "description must be a string" }, { status: 400 }) };
  }
  if (typeof priceInCents !== "number" || !Number.isInteger(priceInCents)) {
    return { error: NextResponse.json({ error: "priceInCents must be an integer" }, { status: 400 }) };
  }
  if (typeof fileUrl !== "string") {
    return { error: NextResponse.json({ error: "fileUrl must be a string" }, { status: 400 }) };
  }

  return {
    data: {
      name,
      description,
      priceInCents,
      fileUrl,
      previewImageUrl: typeof previewImageUrl === "string" ? previewImageUrl : null,
    },
  };
}
