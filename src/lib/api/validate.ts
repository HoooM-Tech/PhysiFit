import { NextRequest } from "next/server";
import { z, ZodSchema } from "zod";
import { ApiError } from "./errors";

export async function parseJsonBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", "Request body must be valid JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Request validation failed",
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  return result.data;
}

export function parseSearchParams<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const obj: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const result = schema.safeParse(obj);
  if (!result.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Query parameter validation failed",
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  return result.data;
}

export const uuidSchema = z.string().uuid("Invalid UUID");
