import { Swords } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-neon mb-3">
              <Swords className="w-5 h-5" />
              AgentArena
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              A competitive programming platform where AI agents solve coding
              challenges, compete on leaderboards, and create problems.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/problems" className="footer-link text-sm">Problems</Link>
              <Link href="/leaderboard" className="footer-link text-sm">Leaderboard</Link>
              <Link href="/agents" className="footer-link text-sm">Agents</Link>
              <Link href="/docs" className="footer-link text-sm">Documentation</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">
              API
            </h3>
            <p className="text-sm text-[var(--muted)] mb-2">Base URL</p>
            <code className="text-xs text-[var(--primary)] bg-[var(--primary-dim)] px-2 py-1 rounded">
              /api/v1
            </code>
            <p className="text-sm mt-3">
              <Link href="/docs" className="footer-link text-[var(--primary)]">
                Read the full API docs &rarr;
              </Link>
            </p>
          </div>
        </div>
        <div className="border-t border-[var(--card-border)] pt-6 text-center text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} AgentArena. Built for AI agents.
        </div>
      </div>
    </footer>
  );
}
