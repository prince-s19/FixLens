import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, repairRequests } from "@/db/schema";
import { runAiAnalysis } from "@/lib/repairKnowledge";

export async function listRepairs(userId: string) {
  return db
    .select()
    .from(repairRequests)
    .where(eq(repairRequests.userId, userId))
    .orderBy(desc(repairRequests.createdAt));
}

export async function getRepair(userId: string, id: string) {
  const rows = await db
    .select()
    .from(repairRequests)
    .where(and(eq(repairRequests.id, id), eq(repairRequests.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createRepair(
  userId: string,
  input: { title: string; category: string; description: string; photoBeforeUrl: string },
) {
  const [row] = await db
    .insert(repairRequests)
    .values({
      userId,
      title: input.title,
      category: input.category,
      description: input.description,
      photoBeforeUrl: input.photoBeforeUrl,
      objectLabel: "",
      status: "analyzing",
    })
    .returning();

  const analysis = runAiAnalysis(input.category, row.id);

  const [updated] = await db
    .update(repairRequests)
    .set({
      objectLabel: analysis.objectLabel,
      damageSummary: analysis.damageSummary,
      damageSeverity: analysis.damageSeverity,
      damageBox: analysis.damageBox,
      difficulty: analysis.difficulty,
      estimatedTimeMinutes: analysis.estimatedTimeMinutes,
      estimatedCostMin: analysis.estimatedCostMin,
      estimatedCostMax: analysis.estimatedCostMax,
      safetyLevel: analysis.safetyLevel,
      safetyNotes: analysis.safetyNotes,
      isDiySafe: analysis.isDiySafe,
      isDangerous: analysis.isDangerous,
      dangerCategory: analysis.dangerCategory ?? null,
      audioNarrationUrlEn: `/api/ai/tts?category=${analysis.category}&lang=en`,
      audioNarrationUrlTa: `/api/ai/tts?category=${analysis.category}&lang=ta`,
      steps: analysis.steps,
      tools: analysis.tools,
      materials: analysis.materials,
      narrationEn: analysis.narrationEn,
      narrationTa: analysis.narrationTa,
      status: analysis.isDangerous ? "escalated" : "ready",
      updatedAt: new Date(),
    })
    .where(eq(repairRequests.id, row.id))
    .returning();

  await db.insert(activityLog).values({
    userId,
    repairRequestId: row.id,
    action: "created",
    detail: `AI analyzed "${input.title}" — detected ${analysis.objectLabel}`,
  });

  return updated;
}

export async function updateRepair(
  userId: string,
  id: string,
  patch: Partial<{
    title: string;
    description: string;
    status: "analyzing" | "ready" | "in_progress" | "completed" | "escalated";
    photoAfterUrl: string;
  }>,
) {
  const existing = await getRepair(userId, id);
  if (!existing) return null;

  const values: Record<string, unknown> = { ...patch, updatedAt: new Date() };
  if (patch.status === "completed") {
    values.completedAt = new Date();
  }

  const [updated] = await db
    .update(repairRequests)
    .set(values)
    .where(and(eq(repairRequests.id, id), eq(repairRequests.userId, userId)))
    .returning();

  if (patch.status && patch.status !== existing.status) {
    await db.insert(activityLog).values({
      userId,
      repairRequestId: id,
      action: "status_changed",
      detail: `Status changed to ${patch.status.replace("_", " ")}`,
    });
  }
  if (patch.photoAfterUrl) {
    await db.insert(activityLog).values({
      userId,
      repairRequestId: id,
      action: "after_photo",
      detail: `Uploaded after-repair photo for "${existing.title}"`,
    });
  }

  return updated;
}

export async function deleteRepair(userId: string, id: string) {
  const [deleted] = await db
    .delete(repairRequests)
    .where(and(eq(repairRequests.id, id), eq(repairRequests.userId, userId)))
    .returning();
  return deleted ?? null;
}

export async function listActivity(userId: string, limit = 40) {
  return db
    .select()
    .from(activityLog)
    .where(eq(activityLog.userId, userId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
