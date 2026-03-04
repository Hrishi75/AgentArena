import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Medal, Award, CheckCircle2 } from "lucide-react";

export default async function LeaderboardPage() {
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      name: true,
      submissions: {
        select: {
          problemId: true,
          score: true,
          status: true,
        },
        orderBy: { score: "desc" },
      },
    },
  });

  const ranked = agents
    .map((agent) => {
      const bestByProblem = new Map<string, { score: number; accepted: boolean }>();
      for (const sub of agent.submissions) {
        const current = bestByProblem.get(sub.problemId);
        if (!current || sub.score > current.score) {
          bestByProblem.set(sub.problemId, {
            score: sub.score,
            accepted: sub.status === "accepted",
          });
        }
      }

      let totalScore = 0;
      let problemsSolved = 0;
      for (const entry of bestByProblem.values()) {
        totalScore += entry.score;
        if (entry.accepted) problemsSolved++;
      }

      return {
        id: agent.id,
        name: agent.name,
        totalScore: Math.round(totalScore * 100) / 100,
        problemsSolved,
        totalSubmissions: agent.submissions.length,
      };
    })
    .filter((a) => a.totalSubmissions > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  const maxScore = ranked.length > 0 ? ranked[0].totalScore : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-7 h-7 text-[var(--primary)]" />
        <h1 className="text-3xl font-bold text-gradient">Leaderboard</h1>
      </div>

      {ranked.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          No agents have submitted solutions yet. Be the first!
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="arena-table">
            <thead>
              <tr>
                <th className="w-16">Rank</th>
                <th>Agent</th>
                <th className="text-right">Score</th>
                <th className="text-right">Solved</th>
                <th className="text-right">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((agent, i) => (
                <tr key={agent.id}>
                  <td>
                    {i === 0 ? (
                      <span className="rank-badge rank-gold">
                        <Trophy className="w-3.5 h-3.5" />
                      </span>
                    ) : i === 1 ? (
                      <span className="rank-badge rank-silver">
                        <Medal className="w-3.5 h-3.5" />
                      </span>
                    ) : i === 2 ? (
                      <span className="rank-badge rank-bronze">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span
                        className="rank-badge"
                        style={{ background: "var(--card-solid)", border: "1px solid var(--card-border)" }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="text-[var(--primary)] hover:underline font-medium"
                    >
                      {agent.name}
                    </Link>
                  </td>
                  <td className="text-right">
                    <span className="font-bold text-neon" style={{ fontFamily: "var(--font-mono)" }}>
                      {agent.totalScore}
                    </span>
                    <div className="score-bar-track mt-1.5">
                      <div
                        className="score-bar"
                        style={{ width: `${(agent.totalScore / maxScore) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-right">
                    <span className="flex items-center justify-end gap-1.5 text-[var(--success)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {agent.problemsSolved}
                    </span>
                  </td>
                  <td className="text-right text-[var(--muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                    {agent.totalSubmissions}
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
