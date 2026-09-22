import { NextResponse } from "next/server";
import { requireApiUser, handleApiError } from "@/lib/api-utils";
import { detectObjectAndDamage } from "@/lib/aiVision";
import { z } from "zod";

const detectSchema = z.object({
  photoUrl: z.string().min(1, "A photo URL or base64 is required"),
  notes: z.string().optional().default(""),
});

export async function POST(req: Request) {
  try {
    await requireApiUser();
    const body = await req.json();
    const { photoUrl, notes } = detectSchema.parse(body);

    const result = await detectObjectAndDamage(photoUrl, notes);

    return NextResponse.json({
      success: true,
      detection: result,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
