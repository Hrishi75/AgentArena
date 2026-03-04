import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Code, SearchX } from "lucide-react";
import { SearchBar } from "@/components/layout/SearchBar";

const difficultyBarClass: Record<string, string> = {
  easy: "difficulty-bar-easy",
  medium: "difficulty-bar-medium",
  hard: "difficulty-bar-hard",
};

const difficultyBadgeClass: Record<string, string> = {
  easy: "difficulty-badge-easy",
  medium: "difficulty-badge-medium",
  hard: "difficulty-badge-hard",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;

  const where: Record<string, unknown> = { status: "approved" };
  if (params.difficulty) where.difficulty = params.difficulty;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  const [problems, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.problem.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <Code className="w-7 h-7 text-[var(--primary)]" />
          <h1 className="text-3xl font-bold text-gradient">Problems</h1>
        </div>
        <div className="w-full sm:w-72">
          <SearchBar />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link
          href="/problems"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !params.difficulty
              ? "btn-primary !py-2 !px-4"
              : "glass-card px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          All
        </Link>
        {["easy", "medium", "hard"].map((d) => (
          <Link
            key={d}
            href={`/problems?difficulty=${d}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              params.difficulty === d
                ? "btn-primary !py-2 !px-4"
                : "glass-card px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {d}
          </Link>
        ))}
      </div>

      {/* Problem List */}
      <div className="space-y-3">
        {problems.map((problem, i) => (
          <Link
            key={problem.id}
            href={`/problems/${problem.slug}`}
            className={`glow-card block p-5 pl-6 ${difficultyBarClass[problem.difficulty]}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[var(--muted)] text-sm w-8" style={{ fontFamily: "var(--font-mono)" }}>
                  {(page - 1) * limit + i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{problem.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1 max-w-md">
                    {problem.description.slice(0, 120)}{problem.description.length > 120 ? "..." : ""}
                  </p>
                  <div className="flex gap-2 mt-1.5">
                    {JSON.parse(problem.tags).map((tag: string) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span
                  className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full ${difficultyBadgeClass[problem.difficulty]}`}
                >
                  {problem.difficulty}
                </span>
                <span className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-mono)" }}>
                  {problem._count.submissions}
                  <span className="text-xs ml-1">submissions</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {problems.length === 0 && (
        <div className="text-center py-20 text-[var(--muted)]">
          <SearchX className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No problems found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i + 1}
              href={`/problems?page=${i + 1}${params.difficulty ? `&difficulty=${params.difficulty}` : ""}${params.search ? `&search=${params.search}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                page === i + 1
                  ? "bg-[var(--primary)] text-black font-bold shadow-[0_0_12px_var(--primary-glow)]"
                  : "glass-card text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
