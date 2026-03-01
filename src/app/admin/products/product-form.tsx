"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const priceInDollars = parseFloat(form.get("price") as string);

    if (isNaN(priceInDollars) || priceInDollars < 0) {
      setError("Price must be a valid non-negative number");
      setLoading(false);
      return;
    }

    const priceInCents = Math.round(priceInDollars * 100);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name") as string,
        description: form.get("description") as string,
        priceInCents,
        fileUrl: form.get("fileUrl") as string,
        previewImageUrl: (form.get("previewImageUrl") as string) || null,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Something went wrong");
      return;
    }

    setSuccess(`Created "${json.data.name}"`);
    e.currentTarget.reset();
    router.refresh();
  }

  const inputClass =
    "mt-1.5 block w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-md bg-card-bg p-5 space-y-4"
    >
      {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
      {success && (
        <p className="text-emerald-500 text-xs font-mono">{success}</p>
      )}

      <label className="block">
        <span className="text-xs font-medium text-muted">Name</span>
        <input name="name" type="text" required className={inputClass} />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Description</span>
        <textarea
          name="description"
          required
          rows={3}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">Price (USD)</span>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="9.99"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">File URL</span>
        <input
          name="fileUrl"
          type="url"
          required
          placeholder="https://..."
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-muted">
          Preview Image URL{" "}
          <span className="text-muted/40">(optional)</span>
        </span>
        <input
          name="previewImageUrl"
          type="url"
          placeholder="https://..."
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity duration-200"
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
