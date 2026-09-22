import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handleApiError, jsonError } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = loginSchema.parse(body);

    const rows = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    const user = rows[0];
    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid email or password.", 401);
    }

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
