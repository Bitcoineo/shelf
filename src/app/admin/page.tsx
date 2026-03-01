import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getOrderStats,
  getRevenueByDay,
  getTopProducts,
  getAllOrders,
} from "@/lib/orders";
import { SignOutButton } from "./products/sign-out-button";
import { ShelfLogo } from "@/app/shelf-logo";
import { ThemeToggle } from "@/app/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [statsResult, chartResult, topResult, recentResult] = await Promise.all(
    [
      getOrderStats(),
      getRevenueByDay(30),
      getTopProducts(5),
      getAllOrders(),
    ]
  );

  const stats = statsResult.data;
  const chartData = chartResult.data ?? [];
  const topProducts = topResult.data ?? [];
  const recentOrders = (recentResult.data ?? []).slice(0, 5);

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShelfLogo />
            <span className="text-border">/</span>
            <span className="text-sm text-foreground">Dashboard</span>
            <Link
              href="/admin/products"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Products
            </Link>
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
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full py-12 px-6">
        <h1 className="text-2xl font-extrabold tracking-tighter mb-8">
          Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="border border-border rounded-md bg-card-bg p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <p className="text-2xl font-mono font-bold text-foreground">
              ${stats ? (stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            </p>
          </div>
          <div className="border border-border rounded-md bg-card-bg p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Completed Orders
            </p>
            <p className="text-2xl font-mono font-bold text-foreground">
              {stats?.totalOrders ?? 0}
            </p>
          </div>
          <div className="border border-border rounded-md bg-card-bg p-5">
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
              Active Products
            </p>
            <p className="text-2xl font-mono font-bold text-foreground">
              {stats?.totalProducts ?? 0}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
            Revenue — Last 30 Days
          </h2>
          <div className="border border-border rounded-md bg-card-bg p-5">
            <div className="h-48 flex items-end gap-[2px]">
              {chartData.map((d) => {
                const height =
                  maxRevenue > 0
                    ? Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 2 : 0)
                    : 0;
                return (
                  <div
                    key={d.date}
                    className="flex-1 group relative"
                    title={`${d.date}: $${(d.revenue / 100).toFixed(2)}`}
                  >
                    <div
                      className="w-full bg-accent/60 hover:bg-accent rounded-t transition-colors duration-150"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-muted/60">
              <span>{chartData[0]?.date.slice(5)}</span>
              <span>{chartData[Math.floor(chartData.length / 2)]?.date.slice(5)}</span>
              <span>{chartData[chartData.length - 1]?.date.slice(5)}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-medium text-muted uppercase tracking-wider">
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-muted hover:text-foreground transition-colors duration-200"
              >
                View all &rarr;
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-muted text-sm">No orders yet.</p>
            ) : (
              <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-card-bg px-4 py-2.5 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">
                        {o.customerEmail}
                      </p>
                      <p className="text-[10px] text-muted">{o.productName}</p>
                    </div>
                    <span className="text-xs font-mono text-muted shrink-0">
                      ${(o.priceInCents / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Top Products */}
          <section>
            <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
              Top Products
            </h2>
            {topProducts.length === 0 ? (
              <p className="text-muted text-sm">No sales yet.</p>
            ) : (
              <div className="border border-border rounded-md overflow-hidden divide-y divide-border">
                {topProducts.map((p, i) => (
                  <div
                    key={p.name}
                    className="bg-card-bg px-4 py-2.5 flex items-center gap-3"
                  >
                    <span className="text-xs font-mono text-muted/50 w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {p.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted shrink-0">
                      {p.orderCount} order{p.orderCount === 1 ? "" : "s"}
                    </span>
                    <span className="text-xs font-mono text-muted shrink-0">
                      ${(p.revenue / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
