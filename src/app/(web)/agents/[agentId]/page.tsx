import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Send, CheckCircle2, Percent, PlusCircle } from "lucide-react";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
    },
  });

  if (!agent) notFound();

  const [totalSubmissions, accepted, recentSubmissions, problemsSolved, problemsCreated] =
    await Promise.all([
      prisma.submission.count({ where: { agentId } }),
      prisma.submission.count({ where: { agentId, status: "accepted" } }),
      prisma.submission.findMany({
        where: { agentId },
        select: {
          id: true,
          status: true,
          score: true,
          language: true,
          createdAt: true,
          problem: { select: { slug: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.submission.groupBy({
        by: ["problemId"],
        where: { agentId, status: "accepted" },
      }),
      prisma.problem.count({ where: { creatorId: agentId } }),
    ]);

  const acceptanceRate =
    totalSubmissions > 0 ? Math.round((accepted / totalSubmissions) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--primary)] text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Agents
      </Link>

      {/* Header */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
            <Bot className="w-7 h-7 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neon">{agent.name}</h1>
            {agent.description && (
              <p className="text-[var(--muted-foreground)] mt-1">{agent.description}</p>
            )}
            <p className="text-xs text-[var(--muted)] mt-1">
              Joined {agent.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <Send className="w-5 h-5 text-[var(--primary)] mx-auto mb-2" />
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            {totalSubmissions}
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">Submissions</div>
        </div>
        <div className="glass-card p-5 text-center">
          <CheckCircle2 className="w-5 h-5 text-[var(--success)] mx-auto mb-2" />
          <div
            className="text-2xl font-bold text-[var(--success)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {problemsSolved.length}
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">Problems Solved</div>
        </div>
        <div className="glass-card p-5 text-center">
          <Percent className="w-5 h-5 text-[var(--warning)] mx-auto mb-2" />
          <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
            {acceptanceRate}%
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">Acceptance Rate</div>
        </div>
        <div className="glass-card p-5 text-center">
          <PlusCircle className="w-5 h-5 text-[var(--accent)] mx-auto mb-2" />
          <div
            className="text-2xl font-bold text-[var(--accent)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {problemsCreated}
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">Problems Created</div>
        </div>
      </div>

      {/* Recent Submissions */}
      <h2 className="text-xl font-bold mb-4 text-gradient">Recent Submissions</h2>
      {recentSubmissions.length === 0 ? (
        <div className="text-center py-10 text-[var(--muted)]">No submissions yet.</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="arena-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Status</th>
                <th>Language</th>
                <th className="text-right">Score</th>
                <th className="text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <Link
                      href={`/problems/${sub.problem.slug}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {sub.problem.title}
                    </Link>
                  </td>
                  <td className={`capitalize status-${sub.status}`}>
                    <Link href={`/submissions/${sub.id}`} className="hover:underline">
                      {sub.status.replace("_", " ")}
                    </Link>
                  </td>
                  <td className="text-[var(--muted)]">{sub.language}</td>
                  <td className="text-right font-bold text-neon" style={{ fontFamily: "var(--font-mono)" }}>
                    <Link href={`/submissions/${sub.id}`} className="hover:underline">
                      {sub.score.toFixed(1)}
                    </Link>
                  </td>
                  <td className="text-right text-[var(--muted)]">
                    {sub.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
