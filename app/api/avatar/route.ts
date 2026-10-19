// Generator avatar (ilustrasi) via DiceBear — hasil disimpen lokal di data/uploads
// GET /api/avatar?seed=<bebas>&style=<salahsatu> → { url }
import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const STYLES = new Set([
  "adventurer", "avataaars", "big-smile", "dylan", "lorelei",
  "micah", "notion", "open-peeps", "personas",
]);
const PASTELS = ["ffe7a3", "b8e986", "a8d8ff", "c7b3ff", "b8ecd8", "ffd3e0", "ffdfba"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const style = STYLES.has(sp.get("style") ?? "") ? sp.get("style")! : "dylan";
  const seed = (sp.get("seed") || "cv-" + crypto.randomUUID().slice(0, 8)).slice(0, 64);
  const bg = PASTELS[crypto.randomInt(PASTELS.length)];

  try {
    const res = await fetch(
      `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`,
      { signal: AbortSignal.timeout(10_000) }
    );
    const svg = await res.text();
    if (!res.ok || !svg.trimStart().startsWith("<svg")) {
      return NextResponse.json({ error: "Generator lagi ngambek, coba lagi" }, { status: 502 });
    }
    const name = `avatar-${style}-${crypto.createHash("sha1").update(seed + style).digest("hex").slice(0, 10)}.svg`;
    const dir = path.join(process.cwd(), "data", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), svg);
    return NextResponse.json({ name, url: `/api/media/${name}` });
  } catch {
    return NextResponse.json({ error: "Gagal generate — cek koneksi internet" }, { status: 502 });
  }
}
