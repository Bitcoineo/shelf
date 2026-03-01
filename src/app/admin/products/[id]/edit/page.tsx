import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProductById } from "@/lib/products";
import { EditProductForm } from "./edit-product-form";
import { SignOutButton } from "../../sign-out-button";
import { ShelfLogo } from "@/app/shelf-logo";
import { ThemeToggle } from "@/app/theme-toggle";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const { data: product } = await getProductById(id);

  if (!product) redirect("/admin/products");

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShelfLogo />
            <span className="text-border">/</span>
            <Link
              href="/admin/products"
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              Admin
            </Link>
            <span className="text-border">/</span>
            <span className="text-sm text-muted">Edit</span>
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

      <main className="flex-1 max-w-3xl mx-auto w-full py-12 px-6">
        <h1 className="text-2xl font-extrabold tracking-tighter mb-10">
          Edit Product
        </h1>

        <EditProductForm product={product} />
      </main>
    </div>
  );
}
