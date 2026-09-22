import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { handleApiError, jsonError } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = registerSchema.parse(body);

    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) {
      return jsonError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const [user] = await db
      .insert(users)
      .values({ name: input.name, email: input.email, passwordHash })
      .returning();

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
