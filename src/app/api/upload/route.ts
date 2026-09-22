import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireApiUser, UnauthorizedError } from "@/lib/api-utils";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  try {
    await requireApiUser();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${ext}`;
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
