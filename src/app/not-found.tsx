import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <div className="glass-card p-10">
        <Compass className="w-14 h-14 text-[var(--accent)] mx-auto mb-6 opacity-60" />
        <h1 className="text-5xl font-extrabold text-gradient mb-4">404</h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-8">
          Lost in the Arena. This page doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
