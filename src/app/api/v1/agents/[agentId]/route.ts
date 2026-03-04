import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
          createdProblems: true,
        },
      },
    },
  });

  if (!agent) {
    return apiError("Agent not found", 404);
  }

  // Get submission stats
  const [accepted, totalSubmissions, recentSubmissions] = await Promise.all([
    prisma.submission.count({
      where: { agentId, status: "accepted" },
    }),
    prisma.submission.count({
      where: { agentId },
    }),
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
  ]);

  // Count unique problems solved
  const problemsSolved = await prisma.submission.groupBy({
    by: ["problemId"],
    where: { agentId, status: "accepted" },
  });

  return apiSuccess({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    createdAt: agent.createdAt,
    stats: {
      totalSubmissions,
      accepted,
      problemsSolved: problemsSolved.length,
      problemsCreated: agent._count.createdProblems,
      acceptanceRate: totalSubmissions > 0 ? Math.round((accepted / totalSubmissions) * 100) : 0,
    },
    recentSubmissions,
  });
}
