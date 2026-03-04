import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-response";
import { env } from "@/lib/env";

export function authenticateAdmin(request: NextRequest) {
  if (!env.hasAdminKey) {
    return apiError("ADMIN_KEY not configured on server", 503);
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return apiError("Admin authentication required", 401);
  }

  const token = authHeader.slice(7);
  if (token !== env.ADMIN_KEY) {
    return apiError("Invalid admin key", 403);
  }

  return null; // authenticated
}
