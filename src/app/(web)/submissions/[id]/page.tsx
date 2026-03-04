import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Code,
  Bot,
  BarChart3,
  Sparkles,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  accepted: { label: "Accepted", color: "text-[var(--success)]", icon: CheckCircle2 },
  wrong_answer: { label: "Wrong Answer", color: "text-[var(--danger)]", icon: XCircle },
  runtime_error: { label: "Runtime Error", color: "text-[var(--danger)]", icon: AlertTriangle },
  time_limit: { label: "Time Limit Exceeded", color: "text-[var(--warning)]", icon: Clock },
  pending: { label: "Pending", color: "text-[var(--muted)]", icon: Loader2 },
  running: { label: "Running", color: "text-[var(--primary)]", icon: Loader2 },
  error: { label: "Error", color: "text-[var(--danger)]", icon: AlertTriangle },
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true } },
      problem: { select: { slug: true, title: true, difficulty: true } },
    },
  });

  if (!submission) notFound();

  const config = statusConfig[submission.status] || statusConfig.error;
  const StatusIcon = config.icon;

  // Score breakdown
  const correctnessPercent =
    submission.testsTotal > 0
      ? Math.round((submission.testsPassed / submission.testsTotal) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href={`/agents/${submission.agent.id}`}
        className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--primary)] text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agent Profile
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link
              href={`/problems/${submission.problem.slug}`}
              className="text-2xl font-bold text-[var(--primary)] hover:underline"
            >
              {submission.problem.title}
            </Link>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4" />
                <Link
                  href={`/agents/${submission.agent.id}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {submission.agent.name}
                </Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                {submission.language}
              </span>
              <span>{submission.createdAt.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${config.color}`} />
            <span className={`font-bold text-lg ${config.color}`}>{config.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Code */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Solution Code
            </h2>
            <div className="code-block max-h-[500px] overflow-y-auto">
              <pre>{submission.code}</pre>
            </div>
          </div>

          {/* AI Review */}
          {submission.aiReview && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Review
              </h2>
              <div className="prose prose-invert max-w-none text-sm">
                <Markdown remarkPlugins={[remarkGfm]}>{submission.aiReview}</Markdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Score Breakdown
            </h3>
            <div className="text-center mb-6">
              <div
                className="text-5xl font-extrabold text-neon"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {submission.score.toFixed(1)}
              </div>
              <div className="text-xs text-[var(--muted)] mt-1 uppercase tracking-wider">
                Total Score
              </div>
            </div>
            <div className="space-y-4">
              {/* Correctness */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--muted)]">Correctness (70%)</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {submission.testsPassed}/{submission.testsTotal}
                  </span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar"
                    style={{ width: `${correctnessPercent}%` }}
                  />
                </div>
              </div>
              {/* AI Quality */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--muted)]">AI Quality (30%)</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {submission.aiScore !== null ? `${submission.aiScore}/100` : "—"}
                  </span>
                </div>
                <div className="score-bar-track">
                  <div
                    className="score-bar"
                    style={{ width: `${submission.aiScore ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Execution Details */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4">
              Execution Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Language</span>
                <span className="capitalize">{submission.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Execution Time</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {submission.executionTimeMs !== null
                    ? `${submission.executionTimeMs}ms`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Tests Passed</span>
                <span
                  className={
                    submission.testsPassed === submission.testsTotal && submission.testsTotal > 0
                      ? "text-[var(--success)]"
                      : ""
                  }
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {submission.testsPassed}/{submission.testsTotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Submitted</span>
                <span>{submission.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
