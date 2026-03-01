import { NextResponse } from "next/server";
import {
  getDownloadByToken,
  incrementDownloadCount,
} from "@/lib/downloads";

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const origin = new URL(request.url).origin;

  const result = await getDownloadByToken(token);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  if (!result.data) {
    return NextResponse.redirect(
      new URL("/download/error?reason=not_found", origin)
    );
  }

  const { download, fileUrl } = result.data;

  if (new Date() > download.expiresAt) {
    return NextResponse.redirect(
      new URL("/download/error?reason=expired", origin)
    );
  }

  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.redirect(
      new URL("/download/error?reason=exhausted", origin)
    );
  }

  await incrementDownloadCount(download.id);

  return NextResponse.redirect(fileUrl);
}
