"use client";

import { useState } from "react";

export function BuyButton({
  productId,
  priceInCents,
}: {
  productId: string;
  priceInCents: number;
}) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priceLabel = `$${(priceInCents / 100).toFixed(2)}`;

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
    <form onSubmit={handleBuy} className="flex flex-col gap-1.5">
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
      <input
        type="email"
        required
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md bg-input-bg px-3 py-1.5 text-sm font-mono placeholder:text-muted/40 focus:outline-none ring-1 ring-border focus:ring-accent transition-all duration-200"
        autoFocus
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setShowEmail(false);
            setEmail("");
            setError("");
          }}
          className="text-xs text-muted hover:text-foreground transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity duration-200 inline-flex items-center gap-1.5"
        >
          {loading ? "Redirecting..." : (
            <>
              Pay {priceLabel}
              <span className="text-xs">&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
