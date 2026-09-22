import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "loose_furniture_screws";
    const lang = searchParams.get("lang") === "ta" ? "ta" : "en";
    const text = searchParams.get("text");

    // Check pre-rendered file first
    const preRenderedPath = path.join(process.cwd(), "public", "audio", lang, `${category}.mp3`);
    try {
      const buffer = await fs.readFile(preRenderedPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      // If not pre-rendered and custom text is provided, generate dynamically with edge-tts
      if (text && text.trim().length > 0) {
        const voice = lang === "ta" ? "ta-IN-PallaviNeural" : "en-IN-NeerjaNeural";
        const tmpDir = path.join(process.cwd(), "public", "uploads", "audio");
        await fs.mkdir(tmpDir, { recursive: true });
        const tmpFile = path.join(tmpDir, `${crypto.randomUUID()}.mp3`);

        const escapedText = text.replace(/"/g, '\\"');
        await execAsync(`python -m edge_tts --voice "${voice}" --text "${escapedText}" --write-media "${tmpFile}"`);
        const generatedBuffer = await fs.readFile(tmpFile);
        await fs.unlink(tmpFile).catch(() => {});

        return new NextResponse(generatedBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    // Fallback to default
    const defaultBuffer = await fs.readFile(path.join(process.cwd(), "public", "audio", lang, "loose_furniture_screws.mp3"));
    return new NextResponse(defaultBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err: any) {
    console.error("[FixLens TTS] Error:", err?.message || err);
    return NextResponse.json({ error: "Audio generation failed" }, { status: 500 });
  }
}
