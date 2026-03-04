"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Code, Trophy, Bot, Shield, BookOpen } from "lucide-react";

const links = [
  { href: "/problems", label: "Problems", icon: Code },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 nav-frosted border-b border-[var(--card-border)] p-4 z-50">
          <nav className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                    isActive
                      ? "text-[var(--primary)] bg-[var(--primary-dim)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
