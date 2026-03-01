"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/app/theme-toggle";
import { ShelfLogo } from "@/app/shelf-logo";

type OrderStatus = "pending" | "completed" | "failed";

type StatusResponse = {
  status: OrderStatus;
  productName?: string;
  downloadToken?: string;
  downloadsRemaining?: number;
  expiresAt?: string;
};

function formatTimeRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const minutes = Math.floor(ms / (1000 * 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <ShelfLogo />
          <ThemeToggle />
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}

export function OrderStatusPoller() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await fetch(
        `/api/orders/status?order_id=${encodeURIComponent(orderId)}`
      );
      if (!res.ok) {
        setError("Failed to check order status");
        return;
      }

      const json: StatusResponse = await res.json();
      setData(json);
    } catch {
      setError("Failed to check order status");
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      return;
    }

    poll();

    const interval = setInterval(() => {
      if (data?.status === "completed" || data?.status === "failed") return;
      poll();
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, data?.status, poll]);

  if (error) {
    return (
      <Shell>
        <h1 className="text-3xl font-extrabold tracking-tighter mb-3">
          Something went wrong
        </h1>
        <p className="text-muted">{error}</p>
        <Link
          href="/"
          className="mt-10 text-sm text-muted hover:text-foreground transition-colors duration-200"
        >
          Back to store
        </Link>
      </Shell>
    );
  }

  if (data?.status === "completed" && data.downloadToken) {
    return (
      <Shell>
        {/* Checkmark */}
        <div className="mb-6 w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
          Your download is ready
        </h1>
        {data.productName && (
          <p className="text-lg text-muted font-mono mb-6">
            {data.productName}
          </p>
        )}

        <a
          href={`/api/download/${data.downloadToken}`}
          className="bg-foreground text-background px-8 py-3 rounded-md text-sm font-medium hover:opacity-80 transition-opacity duration-200"
        >
          Download
        </a>

        <div className="mt-6 text-xs font-mono text-muted text-center space-y-1">
          {data.downloadsRemaining !== undefined && (
            <p>
              {data.downloadsRemaining} download
              {data.downloadsRemaining === 1 ? "" : "s"} remaining
            </p>
          )}
          {data.expiresAt && (
            <p>Link expires in {formatTimeRemaining(data.expiresAt)}</p>
          )}
        </div>

        <Link
          href="/"
          className="mt-10 text-sm text-muted hover:text-foreground transition-colors duration-200"
        >
          Back to store
        </Link>
      </Shell>
    );
  }

  if (data?.status === "failed") {
    return (
      <Shell>
        <h1 className="text-3xl font-extrabold tracking-tighter mb-3">
          Payment failed
        </h1>
        <p className="text-muted">
          Your payment could not be processed. Please try again.
        </p>
        <Link
          href="/"
          className="mt-10 text-sm text-muted hover:text-foreground transition-colors duration-200"
        >
          Back to store
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 h-10 w-10 animate-spin rounded-full border-[3px] spinner" />
      <h1 className="text-3xl font-extrabold tracking-tighter mb-3">
        Processing payment...
      </h1>
      <p className="text-muted text-center max-w-md">
        Waiting for payment confirmation. This usually takes a few seconds.
      </p>
      <Link
        href="/"
        className="mt-10 text-sm text-muted hover:text-foreground transition-colors duration-200"
      >
        Back to store
      </Link>
    </Shell>
  );
}
