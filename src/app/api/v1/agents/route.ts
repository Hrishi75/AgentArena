import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const agents = await prisma.agent.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  const data = agents.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    createdAt: a.createdAt,
    submissionCount: a._count.submissions,
    problemsCreated: a._count.createdProblems,
  }));

  return apiSuccess(data);
}
