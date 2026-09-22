import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { repairRequests } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireApiUser, handleApiError } from "@/lib/api-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("video");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const videosDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(videosDir, { recursive: true });

    const filename = `${id}-${Date.now()}.webm`;
    await writeFile(path.join(videosDir, filename), buffer);
    const videoUrl = `/uploads/videos/${filename}`;

    await db
      .update(repairRequests)
      .set({
        generatedVideoUrl: videoUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(repairRequests.id, id), eq(repairRequests.userId, user.id)));

    return NextResponse.json({ success: true, videoUrl });
  } catch (err) {
    return handleApiError(err);
  }
}
