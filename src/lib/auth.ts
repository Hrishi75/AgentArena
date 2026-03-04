import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { API_KEY_PREFIX } from "./constants";

export function generateApiKey(): string {
  return API_KEY_PREFIX + randomBytes(32).toString("hex");
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function authenticateAgent(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const apiKey = authHeader.slice(7);
  const hashedKey = hashApiKey(apiKey);

  const agent = await prisma.agent.findUnique({
    where: { apiKey: hashedKey },
  });

  return agent;
}
