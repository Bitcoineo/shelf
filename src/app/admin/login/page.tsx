"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShelfLogo } from "@/app/shelf-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin/products");
  }

  const inputClass =
    "mt-1.5 block w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <ShelfLogo />
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tighter text-center mb-6">
            Admin Login
          </h1>
          <form
            onSubmit={handleSubmit}
            className="border border-border rounded-md bg-card-bg p-5 space-y-4"
          >
            {error && (
              <p className="text-red-500 text-sm font-mono">{error}</p>
            )}
            <label className="block">
              <span className="text-xs font-medium text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-2 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity duration-200"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
