"use client";

import { useState, useEffect, useRef } from "react";

export function BuyButton({
  productId,
  priceInCents,
  productName,
}: {
  productId: string;
  priceInCents: number;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const priceLabel = `$${(priceInCents / 100).toFixed(2)}`;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setEmail("");
      setError("");
    }
  }, [open]);

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-foreground text-background px-4 py-1.5 rounded-md text-sm font-medium hover:opacity-80 transition-opacity duration-200 inline-flex items-center gap-1.5"
      >
        Buy
        <span className="text-xs">&rarr;</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative max-w-sm w-full mx-4 border border-border rounded-md bg-card-bg p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors duration-200 text-lg leading-none"
            >
              &times;
            </button>

            <p className="font-semibold text-foreground">{productName}</p>
            <p className="text-sm font-mono text-muted mt-1">{priceLabel}</p>

            <form onSubmit={handleBuy} className="mt-5 space-y-3">
              {error && (
                <p className="text-red-500 text-xs font-mono">{error}</p>
              )}
              <input
                ref={inputRef}
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity duration-200 inline-flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  "Redirecting..."
                ) : (
                  <>
                    Pay {priceLabel}
                    <span className="text-xs">&rarr;</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
