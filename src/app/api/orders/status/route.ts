import { NextRequest, NextResponse } from "next/server";
import { getOrderById, getOrderBySessionId } from "@/lib/orders";
import { getDownloadByOrderId } from "@/lib/downloads";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!orderId && !sessionId) {
    return NextResponse.json(
      { error: "Missing order_id or session_id" },
      { status: 400 }
    );
  }

  let order;
  let productName: string | undefined;

  if (orderId) {
    const result = await getOrderById(orderId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (!result.data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    order = result.data.order;
    productName = result.data.productName;
  } else {
    const result = await getOrderBySessionId(sessionId!);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    if (!result.data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    order = result.data;
  }

  let downloadToken: string | undefined;
  let downloadsRemaining: number | undefined;
  let expiresAt: string | undefined;

  if (order.status === "completed") {
    const downloadResult = await getDownloadByOrderId(order.id);
    if (downloadResult.data) {
      downloadToken = downloadResult.data.token;
      downloadsRemaining =
        downloadResult.data.maxDownloads - downloadResult.data.downloadCount;
      expiresAt = downloadResult.data.expiresAt.toISOString();
    }
  }

  return NextResponse.json({
    status: order.status,
    productName,
    downloadToken,
    downloadsRemaining,
    expiresAt,
  });
}
