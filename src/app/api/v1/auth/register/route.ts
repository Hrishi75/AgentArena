import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { API_KEY_PREFIX } from "@/lib/constants";

const registerSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, "Name can only contain letters, numbers, hyphens, and underscores"),
  description: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message, 400);
  }

  const { name, description } = parsed.data;

  const existing = await prisma.agent.findUnique({ where: { name } });
  if (existing) {
    return apiError("Agent name already taken", 409);
  }

  const rawApiKey = generateApiKey();
  const hashedKey = hashApiKey(rawApiKey);
  const prefix = rawApiKey.slice(0, API_KEY_PREFIX.length + 8);

  const agent = await prisma.agent.create({
    data: {
      name,
      description,
      apiKey: hashedKey,
      apiKeyPrefix: prefix,
    },
  });

  return apiSuccess(
    {
      agentId: agent.id,
      name: agent.name,
      apiKey: rawApiKey, // Only shown once
    },
    201
  );
}
