import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { getOrderCountsByProductIds } from "@/lib/orders";
import { ProductForm } from "./product-form";
import { SignOutButton } from "./sign-out-button";
import { ShelfLogo } from "@/app/shelf-logo";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { data: products, error } = await getActiveProducts();

  const productIds = products?.map((p) => p.id) ?? [];
  const { data: orderCounts } = await getOrderCountsByProductIds(productIds);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShelfLogo />
            <span className="text-border">/</span>
            <Link
              href="/admin"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Dashboard
            </Link>
            <span className="text-sm text-foreground">Products</span>
            <Link
              href="/admin/orders"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Orders
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Store
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full py-12 px-6">
        <h1 className="text-2xl font-extrabold tracking-tighter mb-10">
          Products
        </h1>

        <section className="mb-12">
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Create Product
          </h2>
          <ProductForm />
        </section>

        <section>
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Existing Products
          </h2>
          {error && (
            <p className="text-red-500 text-sm font-mono">{error}</p>
          )}
          {products && products.length === 0 && (
            <p className="text-muted text-sm">No products yet.</p>
          )}
          {products && products.length > 0 && (
            <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
              {products.map((p) => {
                const count = orderCounts?.[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="bg-card-bg px-4 py-4 flex justify-between items-start"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground text-sm">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {p.description}
                      </p>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-xs font-mono text-muted">
                          ${(p.priceInCents / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted">
                          {count} order{count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-6">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs text-muted hover:text-foreground transition-colors duration-200"
                      >
                        Edit
                      </Link>
                      <div className="text-[10px] font-mono text-muted/50 text-right">
                        <p>{p.stripeProductId}</p>
                        <p>{p.stripePriceId}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
