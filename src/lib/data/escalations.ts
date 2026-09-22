import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, escalations, repairRequests, technicians } from "@/db/schema";

export async function listEscalations(userId: string) {
  return db
    .select({
      id: escalations.id,
      repairRequestId: escalations.repairRequestId,
      technicianId: escalations.technicianId,
      reason: escalations.reason,
      urgency: escalations.urgency,
      status: escalations.status,
      notes: escalations.notes,
      createdAt: escalations.createdAt,
      updatedAt: escalations.updatedAt,
      repairTitle: repairRequests.title,
      repairCategory: repairRequests.category,
      repairPhoto: repairRequests.photoBeforeUrl,
      technicianName: technicians.name,
      technicianPhone: technicians.phone,
    })
    .from(escalations)
    .leftJoin(repairRequests, eq(escalations.repairRequestId, repairRequests.id))
    .leftJoin(technicians, eq(escalations.technicianId, technicians.id))
    .where(eq(escalations.userId, userId))
    .orderBy(desc(escalations.createdAt));
}

export async function createEscalation(
  userId: string,
  input: { repairRequestId: string; reason: string; urgency: "low" | "medium" | "high"; technicianId?: string | null },
) {
  const repair = await db
    .select()
    .from(repairRequests)
    .where(and(eq(repairRequests.id, input.repairRequestId), eq(repairRequests.userId, userId)))
    .limit(1);

  if (repair.length === 0) return null;

  const [row] = await db
    .insert(escalations)
    .values({
      userId,
      repairRequestId: input.repairRequestId,
      reason: input.reason,
      urgency: input.urgency,
      technicianId: input.technicianId ?? null,
    })
    .returning();

  await db
    .update(repairRequests)
    .set({ status: "escalated", updatedAt: new Date() })
    .where(eq(repairRequests.id, input.repairRequestId));

  await db.insert(activityLog).values({
    userId,
    repairRequestId: input.repairRequestId,
    action: "escalated",
    detail: `Escalated "${repair[0].title}" to a technician`,
  });

  return row;
}

export async function updateEscalation(
  userId: string,
  id: string,
  patch: Partial<{
    status: "pending" | "accepted" | "in_progress" | "resolved" | "cancelled";
    technicianId: string | null;
    notes: string;
    urgency: "low" | "medium" | "high";
  }>,
) {
  const [row] = await db
    .update(escalations)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(escalations.id, id), eq(escalations.userId, userId)))
    .returning();

  if (row && patch.status === "resolved") {
    await db
      .update(repairRequests)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(repairRequests.id, row.repairRequestId));
  }

  return row ?? null;
}

export async function deleteEscalation(userId: string, id: string) {
  const [row] = await db
    .delete(escalations)
    .where(and(eq(escalations.id, id), eq(escalations.userId, userId)))
    .returning();
  return row ?? null;
}
