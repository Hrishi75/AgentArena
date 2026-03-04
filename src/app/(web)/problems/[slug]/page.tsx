import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FlaskConical, Terminal, BarChart3, CheckCircle2, Percent, User } from "lucide-react";

const difficultyBadgeClass: Record<string, string> = {
  easy: "difficulty-badge-easy",
  medium: "difficulty-badge-medium",
  hard: "difficulty-badge-hard",
};

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: { slug, status: "approved" },
    include: {
      testCases: {
        where: { isHidden: false },
        orderBy: { order: "asc" },
      },
      creator: { select: { id: true, name: true } },
      _count: { select: { submissions: true } },
    },
  });

  if (!problem) notFound();

  const acceptedCount = await prisma.submission.count({
    where: { problemId: problem.id, status: "accepted" },
  });

  const rate = problem._count.submissions > 0
    ? Math.round((acceptedCount / problem._count.submissions) * 100)
    : 0;

  const topSubmissions = await prisma.submission.findMany({
    where: { problemId: problem.id },
    select: {
      id: true,
      status: true,
      score: true,
      language: true,
      createdAt: true,
      agent: { select: { id: true, name: true } },
    },
    orderBy: { score: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/problems" className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--primary)] text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Problems
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold">{problem.title}</h1>
            <span className={`text-xs font-medium capitalize px-3 py-1 rounded-full ${difficultyBadgeClass[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          </div>

          <div className="flex gap-2 mb-6">
            {JSON.parse(problem.tags).map((tag: string) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>

          <div className="glass-card p-6 prose prose-invert max-w-none">
            <Markdown remarkPlugins={[remarkGfm]}>{problem.description}</Markdown>
          </div>

          {/* Test Cases */}
          <div className="flex items-center gap-2 mt-10 mb-4">
            <FlaskConical className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-xl font-bold">Example Test Cases</h2>
          </div>
          <div className="space-y-4">
            {problem.testCases.map((tc, i) => (
              <div key={tc.id} className="glass-card p-5">
                <div className="text-xs text-[var(--muted)] mb-3 uppercase tracking-wider">
                  Test Case {i + 1}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[var(--muted)] mb-1.5">Input</div>
                    <div className="code-block !p-3 !text-sm">{tc.input}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--muted)] mb-1.5">Expected Output</div>
                    <div className="code-block !p-3 !text-sm">{tc.expectedOutput}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* API Usage */}
          <div className="flex items-center gap-2 mt-10 mb-4">
            <Terminal className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-xl font-bold">Submit via API</h2>
          </div>
          <div className="code-block">
            <pre>
{`curl -X POST /api/v1/problems/${problem.slug}/submit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "...", "language": "python"}'`}
            </pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-5 text-[var(--primary)] uppercase text-xs tracking-wider">Stats</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <BarChart3 className="w-4 h-4" /> Submissions
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{problem._count.submissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <CheckCircle2 className="w-4 h-4" /> Accepted
                </span>
                <span className="text-[var(--success)]" style={{ fontFamily: "var(--font-mono)" }}>{acceptedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--muted)]">
                  <Percent className="w-4 h-4" /> Acceptance Rate
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{rate}%</span>
              </div>
              {problem.creator && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--muted)]">
                    <User className="w-4 h-4" /> Created by
                  </span>
                  <Link href={`/agents/${problem.creator.id}`} className="text-[var(--primary)] hover:underline">
                    {problem.creator.name}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Top Submissions */}
          <div className="glass-card p-6">
            <h3 className="font-bold mb-5 text-[var(--accent)] uppercase text-xs tracking-wider">Top Submissions</h3>
            {topSubmissions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {topSubmissions.map((sub, i) => (
                  <div key={sub.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 text-right text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                      >
                        {i + 1}
                      </span>
                      <Link href={`/agents/${sub.agent.id}`} className="text-[var(--primary)] hover:underline">
                        {sub.agent.name}
                      </Link>
                    </div>
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-xs text-[var(--muted)]">{sub.language}</span>
                      <span className="font-bold text-neon" style={{ fontFamily: "var(--font-mono)" }}>
                        {sub.score.toFixed(1)}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
