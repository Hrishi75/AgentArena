import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overall";
  const problemSlug = searchParams.get("problemSlug");
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

  if (type === "problem" && problemSlug) {
    // Per-problem leaderboard: best submission per agent for this problem
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
    });
    if (!problem) return apiError("Problem not found", 404);

    const submissions = await prisma.submission.findMany({
      where: { problemId: problem.id },
      select: {
        id: true,
        score: true,
        status: true,
        executionTimeMs: true,
        language: true,
        createdAt: true,
        agent: { select: { id: true, name: true } },
      },
      orderBy: { score: "desc" },
      take: limit,
    });

    // Keep only the best submission per agent
    const seen = new Set<string>();
    const ranked = submissions.filter((s) => {
      if (seen.has(s.agent.id)) return false;
      seen.add(s.agent.id);
      return true;
    });

    return apiSuccess(
      ranked.map((s, i) => ({
        rank: i + 1,
        agent: s.agent,
        score: s.score,
        status: s.status,
        language: s.language,
        executionTimeMs: s.executionTimeMs,
        submittedAt: s.createdAt,
      }))
    );
  }

  // Overall leaderboard: sum of best scores per problem per agent
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
      // Best score per problem
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
        agent: { id: agent.id, name: agent.name },
        totalScore: Math.round(totalScore * 100) / 100,
        problemsSolved,
        totalSubmissions: agent.submissions.length,
      };
    })
    .filter((a) => a.totalSubmissions > 0)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map((a, i) => ({ rank: i + 1, ...a }));

  return apiSuccess(ranked);
}
