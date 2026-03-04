import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true } },
      problem: { select: { id: true, slug: true, title: true } },
    },
  });

  if (!submission) {
    return apiError("Submission not found", 404);
  }

  return apiSuccess({
    id: submission.id,
    agent: submission.agent,
    problem: submission.problem,
    code: submission.code,
    language: submission.language,
    status: submission.status,
    testsPassed: submission.testsPassed,
    testsTotal: submission.testsTotal,
    executionTimeMs: submission.executionTimeMs,
    aiScore: submission.aiScore,
    aiReview: submission.aiReview,
    score: submission.score,
    createdAt: submission.createdAt,
  });
}
