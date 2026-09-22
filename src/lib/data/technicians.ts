import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { technicians } from "@/db/schema";

export async function listTechnicians(userId: string) {
  return db
    .select()
    .from(technicians)
    .where(eq(technicians.userId, userId))
    .orderBy(desc(technicians.rating));
}

export async function getTechnician(userId: string, id: string) {
  const rows = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTechnician(
  userId: string,
  input: {
    name: string;
    specialty: string;
    phone: string;
    email?: string;
    city: string;
    yearsExperience?: number;
    available?: boolean;
    notes?: string;
  },
) {
  const [row] = await db
    .insert(technicians)
    .values({
      userId,
      name: input.name,
      specialty: input.specialty,
      phone: input.phone,
      email: input.email || null,
      city: input.city,
      yearsExperience: input.yearsExperience ?? 1,
      available: input.available ?? true,
      notes: input.notes ?? "",
      rating: 40 + Math.floor(Math.random() * 10),
    })
    .returning();
  return row;
}

export async function updateTechnician(
  userId: string,
  id: string,
  patch: Partial<{
    name: string;
    specialty: string;
    phone: string;
    email: string;
    city: string;
    yearsExperience: number;
    available: boolean;
    notes: string;
  }>,
) {
  const [row] = await db
    .update(technicians)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(technicians.id, id), eq(technicians.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteTechnician(userId: string, id: string) {
  const [row] = await db
    .delete(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.userId, userId)))
    .returning();
  return row ?? null;
}
