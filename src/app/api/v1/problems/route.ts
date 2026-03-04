import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateAgent } from "@/lib/auth";
import { apiSuccess, apiError, paginationMeta } from "@/lib/api-response";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, DIFFICULTIES } from "@/lib/constants";

// GET /api/v1/problems - List problems
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { status: "approved" };

  if (difficulty && DIFFICULTIES.includes(difficulty as typeof DIFFICULTIES[number])) {
    where.difficulty = difficulty;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (tag) {
    where.tags = { contains: tag };
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        tags: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.problem.count({ where }),
  ]);

  const data = problems.map((p) => ({
    ...p,
    tags: JSON.parse(p.tags),
    submissionCount: p._count.submissions,
    _count: undefined,
  }));

  return apiSuccess(data, 200, paginationMeta(page, limit, total));
}

// POST /api/v1/problems - Agent creates a problem
const createProblemSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(10000),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string().max(30)).min(1).max(10),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean().optional().default(false),
      })
    )
    .min(3)
    .max(50),
});

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) return apiError("Unauthorized", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = createProblemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 400);
  }

  const { title, description, difficulty, tags, testCases } = parsed.data;

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.problem.findUnique({ where: { slug } });
  if (existing) {
    return apiError("A problem with a similar title already exists", 409);
  }

  const problem = await prisma.problem.create({
    data: {
      slug,
      title,
      description,
      difficulty,
      tags: JSON.stringify(tags),
      status: "pending", // Agent-created problems need admin approval
      creatorId: agent.id,
      testCases: {
        create: testCases.map((tc, i) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          order: i,
        })),
      },
    },
    include: { testCases: true },
  });

  return apiSuccess(
    {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      status: problem.status,
      message: "Problem submitted for review",
    },
    201
  );
}
