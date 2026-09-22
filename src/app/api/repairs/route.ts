import { NextResponse } from "next/server";
import { createRepair, listRepairs } from "@/lib/data/repairs";
import { createRepairSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireApiUser();
    const repairs = await listRepairs(user.id);
    return NextResponse.json({ repairs });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = createRepairSchema.parse(body);
    const repair = await createRepair(user.id, {
      title: input.title,
      category: input.category,
      description: input.description ?? "",
      photoBeforeUrl: input.photoBeforeUrl,
    });
    return NextResponse.json({ repair }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
