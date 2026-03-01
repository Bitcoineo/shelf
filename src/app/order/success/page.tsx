import { Suspense } from "react";
import { ShelfLogo } from "@/app/shelf-logo";
import { OrderStatusPoller } from "./order-status";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <ShelfLogo />
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="mb-6 h-10 w-10 animate-spin rounded-full border-[3px] spinner" />
        <h1 className="text-2xl font-extrabold tracking-tighter">
          Loading...
        </h1>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderStatusPoller />
    </Suspense>
  );
}
