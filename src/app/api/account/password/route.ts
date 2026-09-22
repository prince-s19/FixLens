import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { handleApiError, jsonError, requireApiUser } from "@/lib/api-utils";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = schema.parse(body);

    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const dbUser = rows[0];
    if (!dbUser) return jsonError("User not found", 404);

    const valid = await verifyPassword(input.currentPassword, dbUser.passwordHash);
    if (!valid) return jsonError("Current password is incorrect", 401);

    const passwordHash = await hashPassword(input.newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
