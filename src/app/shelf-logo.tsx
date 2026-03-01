import Link from "next/link";

export function ShelfLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="Shelf — home">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-foreground"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="3" y1="16" x2="21" y2="16" />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">Shelf</span>
    </Link>
  );
}
