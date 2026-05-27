import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "UNAUTHENTICATED"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "IDEMPOTENCY_CONFLICT"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "INTERNAL_ERROR";

const STATUS: Record<ErrorCode, number> = {
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  IDEMPOTENCY_CONFLICT: 409,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly userMessage: string,
    public readonly details?: unknown
  ) {
    super(userMessage);
    this.name = "ApiError";
  }

  get status(): number {
    return STATUS[this.code];
  }
}

export type ApiSuccess<T> = { data: T; requestId: string };
export type ApiFailure = {
  error: { code: ErrorCode; message: string; details?: unknown };
  requestId: string;
};

export function successResponse<T>(data: T, requestId: string, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data, requestId }, { status });
}

export function errorResponse(err: unknown, requestId: string): NextResponse<ApiFailure> {
  if (err instanceof ApiError) {
    return NextResponse.json<ApiFailure>(
      {
        error: { code: err.code, message: err.userMessage, details: err.details },
        requestId,
      },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json<ApiFailure>(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        requestId,
      },
      { status: 400 }
    );
  }
  // Unknown error — never leak internals to the client
  console.error(`[${requestId}] Unhandled error:`, err);
  return NextResponse.json<ApiFailure>(
    {
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      requestId,
    },
    { status: 500 }
  );
}
