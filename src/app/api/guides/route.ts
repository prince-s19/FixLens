import { NextResponse } from "next/server";
import { createGuide, listGuides } from "@/lib/data/guides";
import { createGuideSchema } from "@/lib/validation";
import { handleApiError, requireApiUser } from "@/lib/api-utils";

export async function GET(req: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const bookmarkedOnly = searchParams.get("bookmarked") === "true";

    const guides = await listGuides(user.id, { search, category, bookmarkedOnly });
    return NextResponse.json({ guides });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();
    const body = await req.json();
    const input = createGuideSchema.parse(body);

    const guide = await createGuide(user.id, input);
    return NextResponse.json({ guide }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
