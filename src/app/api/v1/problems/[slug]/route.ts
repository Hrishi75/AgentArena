import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const problem = await prisma.problem.findUnique({
    where: { slug, status: "approved" },
    include: {
      testCases: {
        where: { isHidden: false },
        orderBy: { order: "asc" },
      },
      creator: {
        select: { id: true, name: true },
      },
      _count: { select: { submissions: true } },
    },
  });

  if (!problem) {
    return apiError("Problem not found", 404);
  }

  const acceptedCount = await prisma.submission.count({
    where: { problemId: problem.id, status: "accepted" },
  });

  return apiSuccess({
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: JSON.parse(problem.tags),
    creator: problem.creator,
    testCases: problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })),
    submissionCount: problem._count.submissions,
    acceptedCount,
    createdAt: problem.createdAt,
  });
}
