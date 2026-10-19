// Tempel foto ke personal.photo CV tertentu
// Pakai: node scripts/set-foto.mjs <slug-atau-id-cv> <path-foto|URL-path>
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// [slug/id, sumber satu arg kemudian sisa join — file lokal disalin ke data/uploads]
const args = process.argv.slice(2);
const cvRef = args[0];
let source = args[1];
if (!cvRef || !source) { console.error("Pakai: node scripts/set-foto.mjs <slug|id> <file|/api/media/x>"); process.exit(1); }

// kalau file lokal: copy ke data/uploads biar diserve app
let photoPath = source;
if (fs.existsSync(source) && fs.statSync(source).isFile()) {
  const ext = path.extname(source).toLowerCase() || ".jpg";
  const name = `foto-${crypto.randomUUID().slice(0, 8)}${ext}`;
  fs.mkdirSync(path.join(process.cwd(), "data", "uploads"), { recursive: true });
  fs.copyFileSync(source, path.join(process.cwd(), "data", "uploads", name));
  photoPath = `/api/media/${name}`;
}

const db = new DatabaseSync(path.join(process.cwd(), "data", "cv-maker.db"));
const row = db.prepare("SELECT id, data FROM cvs WHERE slug = ? OR id = ?").get(cvRef, cvRef);
if (!row) { console.error("CV gak ketemu:", cvRef); process.exit(1); }
const d = JSON.parse(row.data);
d.personal.photo = photoPath;
db.prepare("UPDATE cvs SET data = ? WHERE id = ?").run(JSON.stringify(d), row.id);
console.log(`CV "${d.personal.full_name}" → photo: ${photoPath}`);
