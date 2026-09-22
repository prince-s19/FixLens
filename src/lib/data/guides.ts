import "server-only";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, savedRepairGuides, type SavedRepairGuide } from "@/db/schema";

export async function listGuides(
  userId: string,
  options?: { search?: string; category?: string; bookmarkedOnly?: boolean },
) {
  let query = db
    .select()
    .from(savedRepairGuides)
    .where(eq(savedRepairGuides.userId, userId))
    .orderBy(desc(savedRepairGuides.createdAt));

  const rows = (await query) as SavedRepairGuide[];

  return rows.filter((guide: SavedRepairGuide) => {
    if (options?.category && options.category !== "all") {
      if (guide.category !== options.category) return false;
    }
    if (options?.bookmarkedOnly) {
      if (!guide.isBookmarked) return false;
    }
    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase();
      const matchTitle = guide.title.toLowerCase().includes(q);
      const matchNotes = guide.userNotes.toLowerCase().includes(q);
      const matchTools = guide.tools.some((t: string) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchTools) return false;
    }
    return true;
  });
}

export async function getGuide(userId: string, id: string) {
  const rows = await db
    .select()
    .from(savedRepairGuides)
    .where(and(eq(savedRepairGuides.id, id), eq(savedRepairGuides.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createGuide(
  userId: string,
  input: {
    repairRequestId?: string | null;
    title: string;
    category: string;
    difficulty?: "easy" | "medium" | "hard";
    estimatedTimeMinutes?: number;
    estimatedCostMin?: number;
    estimatedCostMax?: number;
    tools?: string[];
    materials?: string[];
    steps?: { order: number; title: string; description: string; durationSeconds: number }[];
    safetyNotes?: string[];
    videoUrl?: string | null;
    coverImageUrl?: string | null;
    userNotes?: string;
    tags?: string[];
  },
) {
  const [created] = await db
    .insert(savedRepairGuides)
    .values({
      userId,
      repairRequestId: input.repairRequestId ?? null,
      title: input.title,
      category: input.category,
      difficulty: input.difficulty ?? "easy",
      estimatedTimeMinutes: input.estimatedTimeMinutes ?? 15,
      estimatedCostMin: input.estimatedCostMin ?? 0,
      estimatedCostMax: input.estimatedCostMax ?? 0,
      tools: input.tools ?? [],
      materials: input.materials ?? [],
      steps: input.steps ?? [],
      safetyNotes: input.safetyNotes ?? [],
      videoUrl: input.videoUrl ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      userNotes: input.userNotes ?? "",
      tags: input.tags ?? [],
    })
    .returning();

  await db.insert(activityLog).values({
    userId,
    repairRequestId: input.repairRequestId ?? null,
    action: "guide_saved",
    detail: `Saved reusable repair guide "${created.title}" to library`,
  });

  return created;
}

export async function updateGuide(
  userId: string,
  id: string,
  patch: Partial<{
    title: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    estimatedTimeMinutes: number;
    estimatedCostMin: number;
    estimatedCostMax: number;
    tools: string[];
    materials: string[];
    steps: { order: number; title: string; description: string; durationSeconds: number }[];
    safetyNotes: string[];
    userNotes: string;
    isBookmarked: boolean;
    tags: string[];
  }>,
) {
  const existing = await getGuide(userId, id);
  if (!existing) return null;

  const [updated] = await db
    .update(savedRepairGuides)
    .set({
      ...patch,
      updatedAt: new Date(),
    })
    .where(and(eq(savedRepairGuides.id, id), eq(savedRepairGuides.userId, userId)))
    .returning();

  await db.insert(activityLog).values({
    userId,
    action: "guide_updated",
    detail: `Updated saved guide "${updated.title}"`,
  });

  return updated;
}

export async function deleteGuide(userId: string, id: string) {
  const [deleted] = await db
    .delete(savedRepairGuides)
    .where(and(eq(savedRepairGuides.id, id), eq(savedRepairGuides.userId, userId)))
    .returning();

  if (deleted) {
    await db.insert(activityLog).values({
      userId,
      action: "guide_deleted",
      detail: `Deleted saved guide "${deleted.title}"`,
    });
  }

  return deleted ?? null;
}
