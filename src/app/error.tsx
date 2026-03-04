"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <div className="glass-card p-10">
        <AlertTriangle className="w-14 h-14 text-[var(--danger)] mx-auto mb-6 opacity-60" />
        <h1 className="text-3xl font-extrabold text-gradient mb-4">
          Something went wrong
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
