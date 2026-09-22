import { NextResponse } from "next/server";
import { createEscalation, listEscalations } from "@/lib/data/escalations";
import { createEscalationSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireApiUser();
    const escalations = await listEscalations(user.id);
    return NextResponse.json({ escalations });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = createEscalationSchema.parse(body);
    const escalation = await createEscalation(user.id, input);
    if (!escalation) return NextResponse.json({ error: "Repair request not found" }, { status: 404 });
    return NextResponse.json({ escalation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
