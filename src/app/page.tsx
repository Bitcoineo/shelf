import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { auth } from "@/auth";
import { BuyButton } from "./buy-button";
import { ThemeToggle } from "./theme-toggle";
import { ShelfLogo } from "./shelf-logo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ data: products, error }, session] = await Promise.all([
    getActiveProducts(),
    auth(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero (nav floats inside) */}
      <section className="hero-gradient dot-grid">
        <nav>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <ShelfLogo />
            <div className="flex items-center gap-3">
              {session && (
                <Link
                  href="/admin/products"
                  className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                >
                  Admin
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter mb-2 text-[var(--fg-secondary)]">
            Digital products,{" "}
            <span className="gradient-text">instant delivery</span>
          </h1>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Premium digital goods. Pay once, download instantly.
          </p>
        </div>
      </section>

      {/* Products */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {error && (
          <p className="text-red-500 text-sm mb-6 font-mono">{error}</p>
        )}

        {products && products.length === 0 && (
          <p className="text-muted text-center py-20">
            No products available yet.
          </p>
        )}

        {products && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {products.map((product) => (
              <div
                key={product.id}
                className="group w-full border border-border rounded-md overflow-hidden flex flex-col bg-card-bg hover:border-[var(--muted)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200"
              >
                {product.previewImageUrl ? (
                  <div className="h-40 bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.previewImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-[var(--placeholder-bg)] flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--placeholder-icon)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <polyline points="9 15 12 12 15 15" />
                    </svg>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted mt-1 flex-1 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-mono text-muted shrink-0">
                      ${(product.priceInCents / 100).toFixed(2)}
                    </span>
                    <BuyButton productId={product.id} priceInCents={product.priceInCents} productName={product.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center gap-2.5 text-[11px] text-muted/60">
            <span>Built by Bitcoineo</span>
            <a
              href="https://github.com/Bitcoineo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted/40 hover:text-muted transition-colors duration-200"
              aria-label="GitHub"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <a
              href="https://x.com/Bitcoineo_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted/40 hover:text-muted transition-colors duration-200"
              aria-label="X"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
        </div>
      </footer>
    </div>
  );
}
