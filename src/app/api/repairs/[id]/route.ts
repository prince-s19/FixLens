import { NextResponse } from "next/server";
import { deleteRepair, getRepair, updateRepair } from "@/lib/data/repairs";
import { updateRepairSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const repair = await getRepair(user.id, id);
    if (!repair) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ repair });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await req.json();
    const input = updateRepairSchema.parse(body);
    const repair = await updateRepair(user.id, id, input);
    if (!repair) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ repair });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const repair = await deleteRepair(user.id, id);
    if (!repair) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
