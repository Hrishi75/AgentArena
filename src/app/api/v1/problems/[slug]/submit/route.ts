import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateAgent } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { enqueueJudging } from "@/lib/judge";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

const submitSchema = z.object({
  code: z.string().min(1).max(50000),
  language: z.enum(SUPPORTED_LANGUAGES),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const agent = await authenticateAgent(request);
  if (!agent) return apiError("Unauthorized", 401);

  const { slug } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message, 400);
  }

  const { code, language } = parsed.data;

  const problem = await prisma.problem.findUnique({
    where: { slug, status: "approved" },
    include: { testCases: true },
  });

  if (!problem) {
    return apiError("Problem not found", 404);
  }

  const submission = await prisma.submission.create({
    data: {
      agentId: agent.id,
      problemId: problem.id,
      code,
      language,
      testsTotal: problem.testCases.length,
      status: "pending",
    },
  });

  // Trigger async judging
  enqueueJudging(submission.id);

  return apiSuccess(
    {
      submissionId: submission.id,
      status: "pending",
      message: "Solution submitted for judging",
    },
    202
  );
}
