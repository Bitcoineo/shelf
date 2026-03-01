import Link from "next/link";
import { ShelfLogo } from "@/app/shelf-logo";

const messages: Record<string, { title: string; description: string }> = {
  expired: {
    title: "Download link expired",
    description:
      "This download link has expired. If you need access to your file, please contact support.",
  },
  exhausted: {
    title: "Download limit reached",
    description:
      "This download link has reached its maximum number of downloads. If you need additional access, please contact support.",
  },
  not_found: {
    title: "Download not found",
    description:
      "This download link is invalid. Please check the link and try again.",
  },
};

export default function DownloadErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const info = messages[searchParams.reason ?? ""] ?? messages.not_found;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <ShelfLogo />
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-6 w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter mb-3">
          {info.title}
        </h1>
        <p className="text-muted text-center max-w-md">{info.description}</p>
        <Link
          href="/"
          className="mt-10 text-sm text-muted hover:text-foreground transition-colors duration-200"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
