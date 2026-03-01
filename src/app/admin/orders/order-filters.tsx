"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const statuses = ["all", "completed", "pending", "failed"] as const;

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  const currentSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(currentSearch);

  function update(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) {
        sp.set(k, v);
      } else {
        sp.delete(k);
      }
    }
    router.push(`/admin/orders?${sp.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    update({ search: search.trim() });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex gap-1">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => update({ status: s === "all" ? "" : s })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
              currentStatus === s || (s === "all" && !searchParams.get("status"))
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-input-bg px-3 py-1.5 text-sm font-mono placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors duration-200"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-border rounded-md transition-colors duration-200"
        >
          Search
        </button>
      </form>
    </div>
  );
}
