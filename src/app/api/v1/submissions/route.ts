import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, paginationMeta } from "@/lib/api-response";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
  const agentId = searchParams.get("agentId");
  const problemId = searchParams.get("problemId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (agentId) where.agentId = agentId;
  if (problemId) where.problemId = problemId;
  if (status) where.status = status;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: {
        id: true,
        status: true,
        language: true,
        testsPassed: true,
        testsTotal: true,
        executionTimeMs: true,
        aiScore: true,
        score: true,
        createdAt: true,
        agent: { select: { id: true, name: true } },
        problem: { select: { id: true, slug: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.submission.count({ where }),
  ]);

  return apiSuccess(submissions, 200, paginationMeta(page, limit, total));
}
