import { NextResponse } from "next/server";
import { deleteTechnician, updateTechnician } from "@/lib/data/technicians";
import { updateTechnicianSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await req.json();
    const input = updateTechnicianSchema.parse(body);
    const technician = await updateTechnician(user.id, id, input);
    if (!technician) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ technician });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const technician = await deleteTechnician(user.id, id);
    if (!technician) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
