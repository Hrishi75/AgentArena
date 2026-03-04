"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X, Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/pending-problems")
      .then((r) => r.json())
      .then((data) => {
        setProblems(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAction(problemId: string, action: "approved" | "rejected") {
    await fetch(`/api/v1/admin/review-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId, status: action }),
    });
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-7 h-7 text-[var(--primary)]" />
        <h1 className="text-3xl font-bold text-gradient">Admin - Review Problems</h1>
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
