// Sajikan foto upload: GET /api/media/<nama> — dari data/uploads
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // hanya nama file polos — cegah path traversal
  if (!/^[\w.-]+$/.test(name)) return NextResponse.json({ error: "Nama tidak valid" }, { status: 400 });
  const file = path.join(process.cwd(), "data", "uploads", name);
  if (!fs.existsSync(file)) return NextResponse.json({ error: "File tidak ada" }, { status: 404 });
  const buf = fs.readFileSync(file);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
