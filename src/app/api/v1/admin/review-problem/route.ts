import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/admin-auth";

const reviewSchema = z.object({
  problemId: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export async function POST(request: NextRequest) {
  const authError = authenticateAdmin(request);
  if (authError) return authError;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message, 400);
  }

  const { problemId, status } = parsed.data;

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) return apiError("Problem not found", 404);
  if (problem.status !== "pending") return apiError("Problem is not pending review", 400);

  await prisma.problem.update({
    where: { id: problemId },
    data: { status },
  });

  return apiSuccess({ id: problemId, status });
}
