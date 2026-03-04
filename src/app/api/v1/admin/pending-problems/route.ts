import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = authenticateAdmin(request);
  if (authError) return authError;

  const problems = await prisma.problem.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(problems);
}
