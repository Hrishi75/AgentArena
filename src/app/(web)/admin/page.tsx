"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Check, X, Loader2, KeyRound, LogOut } from "lucide-react";

interface PendingProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  description: string;
  tags: string;
  creatorId: string | null;
  createdAt: string;
}

const difficultyBadgeClass: Record<string, string> = {
  easy: "difficulty-badge-easy",
  medium: "difficulty-badge-medium",
  hard: "difficulty-badge-hard",
};

export default function AdminPage() {
  const [problems, setProblems] = useState<PendingProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [keyInput, setKeyInput] = useState("");

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("adminKey");
    if (stored) {
      setAdminKey(stored);
      setAuthenticated(true);
    }
  }, []);

  const fetchProblems = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/admin/pending-problems", {
        headers: { Authorization: `Bearer ${key}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setAuthenticated(false);
        sessionStorage.removeItem("adminKey");
        return;
      }
      setProblems(data.data || []);
      setAuthenticated(true);
      setAdminKey(key);
      sessionStorage.setItem("adminKey", key);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when authenticated from sessionStorage
  useEffect(() => {
    if (authenticated && adminKey) {
      fetchProblems(adminKey);
    }
  }, [authenticated, adminKey, fetchProblems]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    fetchProblems(keyInput.trim());
  }

  function handleLogout() {
    setAuthenticated(false);
    setAdminKey("");
    setKeyInput("");
    setProblems([]);
    sessionStorage.removeItem("adminKey");
  }

  async function handleAction(problemId: string, action: "approved" | "rejected") {
    const res = await fetch("/api/v1/admin/review-problem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminKey}`,
      },
      body: JSON.stringify({ problemId, status: action }),
    });
    if (res.ok) {
      setProblems((prev) => prev.filter((p) => p.id !== problemId));
    }
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="glass-card p-8 text-center">
          <KeyRound className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gradient mb-2">Admin Access</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Enter the admin key to manage problems
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter admin key..."
              className="w-full px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors mb-4"
              autoFocus
            />
            {error && (
              <p className="text-[var(--danger)] text-sm mb-4">{error}</p>
            )}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {loading ? "Authenticating..." : "Authenticate"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-[var(--primary)]" />
          <h1 className="text-3xl font-bold text-gradient">Admin - Review Problems</h1>
        </div>
        <button onClick={handleLogout} className="btn-secondary !py-2 !px-3 text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-[var(--primary)]" />
          Loading pending problems...
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No pending problems to review.
        </div>
      ) : (
        <div className="space-y-4">
          {problems.map((problem) => (
            <div key={problem.id} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{problem.title}</h3>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${difficultyBadgeClass[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                    {JSON.parse(problem.tags).map((tag: string) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(problem.id, "approved")}
                    className="btn-approve"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(problem.id, "rejected")}
                    className="btn-reject"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
              <div className="code-block !p-4 max-h-40 overflow-y-auto whitespace-pre-wrap !text-[var(--muted-foreground)] !text-xs">
                {problem.description.slice(0, 500)}
                {problem.description.length > 500 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
