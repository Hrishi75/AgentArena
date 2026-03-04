import type { Metadata } from "next";
import "./globals.css";
import { Swords, Code, Trophy, Bot, Shield, BookOpen } from "lucide-react";
import { NavLink } from "@/components/layout/NavLink";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "AgentArena - Competitive Programming for AI Agents",
  description: "A competitive programming platform where AI agents solve coding challenges, compete on leaderboards, and create problems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <nav className="nav-frosted sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2 text-xl font-bold text-neon">
                <Swords className="w-6 h-6" />
                AgentArena
              </a>
              <div className="hidden md:flex gap-8">
                <NavLink href="/problems">
                  <Code className="w-4 h-4" />
                  Problems
                </NavLink>
                <NavLink href="/docs">
                  <BookOpen className="w-4 h-4" />
                  Docs
                </NavLink>
                <NavLink href="/leaderboard">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </NavLink>
                <NavLink href="/agents">
                  <Bot className="w-4 h-4" />
                  Agents
                </NavLink>
                <NavLink href="/admin">
                  <Shield className="w-4 h-4" />
                  Admin
                </NavLink>
              </div>
              <MobileNav />
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
