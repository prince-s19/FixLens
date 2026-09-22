import { NextResponse } from "next/server";
import { deleteEscalation, updateEscalation } from "@/lib/data/escalations";
import { updateEscalationSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const body = await req.json();
    const input = updateEscalationSchema.parse(body);
    const escalation = await updateEscalation(user.id, id, input);
    if (!escalation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ escalation });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const escalation = await deleteEscalation(user.id, id);
    if (!escalation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
