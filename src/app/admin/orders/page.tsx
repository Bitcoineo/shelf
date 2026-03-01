import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllOrders } from "@/lib/orders";
import { OrderFilters } from "./order-filters";
import { SignOutButton } from "../products/sign-out-button";
import { ShelfLogo } from "@/app/shelf-logo";
import { ThemeToggle } from "@/app/theme-toggle";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "text-emerald-500 bg-emerald-500/10",
    pending: "text-yellow-500 bg-yellow-500/10",
    failed: "text-red-500 bg-red-500/10",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || "text-muted bg-muted/10"}`}
    >
      {status}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const { data: orderList, error } = await getAllOrders(
    params.status,
    params.search
  );

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
            <Link
              href="/admin/products"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Products
            </Link>
            <span className="text-sm text-foreground">Orders</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Store
            </Link>
            <SignOutButton />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
        <h1 className="text-2xl font-extrabold tracking-tighter mb-8">
          Orders
        </h1>

        <Suspense>
          <OrderFilters />
        </Suspense>

        {error && (
          <p className="text-red-500 text-sm font-mono mb-4">{error}</p>
        )}

        {orderList && orderList.length === 0 && (
          <p className="text-muted text-sm">No orders found.</p>
        )}

        {orderList && orderList.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
            {orderList.map((o) => (
              <div
                key={o.id}
                className="bg-card-bg px-4 py-3 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-mono truncate">
                    {o.customerEmail}
                  </p>
                  <Link
                    href={`/admin/products/${o.productId}/edit`}
                    className="text-xs text-muted hover:text-foreground transition-colors duration-200"
                  >
                    {o.productName}
                  </Link>
                </div>
                <span className="text-sm font-mono text-muted shrink-0">
                  ${(o.priceInCents / 100).toFixed(2)}
                </span>
                <StatusBadge status={o.status} />
                <span className="text-xs text-muted shrink-0 w-20 text-right">
                  {o.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
