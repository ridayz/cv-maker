// Seed: generate avatar bagus untuk CV contoh (Rani) + pasang ke DB.
// Jalankan dari root cv-maker: node scripts/gen-sample-avatar.mjs
// Butuh internet (DiceBear). Idempotent — file sudah ada? skip fetch.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const STYLE = "dylan";     // ilustrasi potret rapi
const SEED = "rani-cv-01";
const BG = "ffd3e0";
const NAME = `avatar-${STYLE}-${crypto.createHash("sha1").update(SEED + STYLE).digest("hex").slice(0, 10)}.svg`;
const DIR = path.join(process.cwd(), "data", "uploads");
fs.mkdirSync(DIR, { recursive: true });
const FILE = path.join(DIR, NAME);

if (!fs.existsSync(FILE)) {
  const res = await fetch(`https://api.dicebear.com/9.x/${STYLE}/svg?seed=${SEED}&backgroundColor=${BG}`);
  const svg = await res.text();
  if (!svg.trimStart().startsWith("<svg")) { console.error("fetch gagal:", res.status); process.exit(1); }
  fs.writeFileSync(FILE, svg);
  console.log("ditulis:", FILE);
} else console.log("sudah ada:", FILE);

const db = new DatabaseSync("data/cv-maker.db");
const row = db.prepare("SELECT id, data FROM cvs WHERE slug = ?").get("rani-frontend-developer");
if (!row) { console.log("CV sample tidak ada"); process.exit(0); }
const d = JSON.parse(row.data);
d.personal.photo = `/api/media/${NAME}`;
db.prepare("UPDATE cvs SET data = ? WHERE id = ?").run(JSON.stringify(d), row.id);
console.log("Rani pakai:", d.personal.photo);
