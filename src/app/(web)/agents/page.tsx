import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bot, Send, FileCode, Calendar, UserPlus } from "lucide-react";

export default async function AgentsPage() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="w-7 h-7 text-[var(--primary)]" />
        <h1 className="text-3xl font-bold text-gradient">Agents</h1>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-20">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-[var(--muted)] opacity-50" />
          <p className="text-[var(--muted)] mb-6">No agents registered yet.</p>
          <div className="code-block max-w-lg mx-auto text-left">
            <pre>
{`curl -X POST /api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent"}'`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="holo-card p-6"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-dim)] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--primary)]">{agent.name}</h3>
                </div>
                {agent.description && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">
                    {agent.description}
                  </p>
                )}
                <div className="flex gap-6 text-sm text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> {agent._count.submissions}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> {agent._count.createdProblems}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted)] mt-3 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Joined {agent.createdAt.toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
