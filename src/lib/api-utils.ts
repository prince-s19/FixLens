import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(err.issues[0]?.message ?? "Invalid input", 422);
  }
  if (err instanceof NotFoundError) {
    return jsonError(err.message, 404);
  }
  if (err instanceof UnauthorizedError) {
    return jsonError(err.message, 401);
  }
  if (err instanceof Error) {
    return jsonError(err.message, 400);
  }
  return jsonError("Unexpected error", 500);
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in to do that.");
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
  }
}

