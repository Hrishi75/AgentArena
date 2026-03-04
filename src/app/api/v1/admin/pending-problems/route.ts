import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const problems = await prisma.problem.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(problems);
}
