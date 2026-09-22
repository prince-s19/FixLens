import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "fixit_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  preferredLanguage: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      preferredLanguage: users.preferredLanguage,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    preferredLanguage: row.preferredLanguage,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Not authenticated");
  }
  return user;
}

export class AuthError extends Error {}
