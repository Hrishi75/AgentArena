"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`nav-link flex items-center gap-1.5 text-sm font-medium ${
        isActive ? "nav-link-active" : ""
      }`}
    >
      {children}
    </Link>
  );
}
