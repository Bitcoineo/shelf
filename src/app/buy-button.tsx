"use client";

import { useState } from "react";

export function BuyButton({ productId }: { productId: string }) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }

    window.location.href = json.url;
  }

  if (!showEmail) {
    return (
      <button
        onClick={() => setShowEmail(true)}
        className="bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity duration-200 inline-flex items-center gap-1.5"
      >
        Buy
        <span className="text-xs">&rarr;</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleBuy} className="flex flex-col gap-2 w-full mt-2">
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border border-border bg-input-bg px-3 py-1.5 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200"
        autoFocus
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity duration-200"
      >
        {loading ? "Redirecting..." : "Pay now"}
      </button>
    </form>
  );
}
