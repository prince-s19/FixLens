import { NextResponse } from "next/server";
import { deleteGuide, getGuide, updateGuide } from "@/lib/data/guides";
import { updateGuideSchema } from "@/lib/validation";
import { handleApiError, requireApiUser, NotFoundError } from "@/lib/api-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const guide = await getGuide(user.id, id);
    if (!guide) throw new NotFoundError("Guide not found");
    return NextResponse.json({ guide });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await req.json();
    const patch = updateGuideSchema.parse(body);

    const updated = await updateGuide(user.id, id, patch as any);
    if (!updated) throw new NotFoundError("Guide not found");
    return NextResponse.json({ guide: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const deleted = await deleteGuide(user.id, id);
    if (!deleted) throw new NotFoundError("Guide not found");
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
