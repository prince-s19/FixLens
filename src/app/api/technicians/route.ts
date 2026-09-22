import { NextResponse } from "next/server";
import { createTechnician, listTechnicians } from "@/lib/data/technicians";
import { createTechnicianSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireApiUser();
    const technicians = await listTechnicians(user.id);
    return NextResponse.json({ technicians });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = createTechnicianSchema.parse(body);
    const technician = await createTechnician(user.id, input);
    return NextResponse.json({ technician }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
