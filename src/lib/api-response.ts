import { NextResponse } from "next/server";

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

export function apiSuccess<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, ...(meta && { meta }) }, { status });
}

export function apiError(
  error: string,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error }, { status });
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
