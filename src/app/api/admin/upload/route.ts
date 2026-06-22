import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MANUAL_DIR = path.join(process.cwd(), "public", "uploads", "manual");
const MAX_BYTES = 15 * 1024 * 1024; // 15MB per file
const FULL_WIDTH = 1200;

/**
 * Accepts one or more image files (multipart form field `files`), resizes each
 * to max 1200px wide webp, stores under public/uploads/manual, and returns the
 * served URLs. Used by the product editor's drag-and-drop uploader.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Pritej formë me skedarë" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Asnjë skedar i dërguar" }, { status: 400 });
  }

  await fs.mkdir(MANUAL_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: `"${file.name}" nuk është imazh` },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" është më i madh se 15MB` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.webp`;
    const dest = path.join(MANUAL_DIR, name);
    try {
      await sharp(buffer)
        .rotate() // respect EXIF orientation
        .resize(FULL_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(dest);
    } catch {
      return NextResponse.json(
        { error: `Përpunimi i "${file.name}" dështoi` },
        { status: 400 }
      );
    }
    urls.push(`/uploads/manual/${name}`);
  }

  return NextResponse.json({ urls });
}
