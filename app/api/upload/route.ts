// API upload foto: POST multipart → data/uploads (nama disanitasi, maks 2MB)
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ada" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Harus PNG/JPG/WebP" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Maksimal 2MB" }, { status: 400 });
  const ext = file.type === "image/png" ? ".png" : file.type === "image/jpeg" ? ".jpg" : ".webp";
  const name = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "data", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ name }, { status: 201 });
}
