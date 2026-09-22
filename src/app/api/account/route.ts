import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  preferredLanguage: z.enum(["en", "ta"]).optional(),
});

export async function PATCH(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = patchSchema.parse(body);

    const [updated] = await db.update(users).set(input).where(eq(users.id, user.id)).returning();

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        preferredLanguage: updated.preferredLanguage,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
