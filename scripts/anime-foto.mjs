// Edit foto → gaya anime pakai Gemini 2.5 Flash Image (nano banana)
// Pakai: node scripts/anime-foto.mjs <file-foto> [--gaya anime|ghibli|chibi|kartun] [--cv <slug-cv>]
// Key: dari env GEMINI_API_KEY atau flag --key <KEY>
// Hasil: data/uploads/avatar-ai-<ts>.png → otomatis ditempel ke CV kalau --cv disertai
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// ---- argumen ----
const args = process.argv.slice(2);
function argVal(name) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}
const input = argVal("--foto") ?? args[0];
const ceo = argVal("--cv"); // slug cv (opsional)
let key = argVal("--key") ?? process.env.GEMINI_API_KEY;
const gaya = (argVal("--gaya") ?? "anime").toLowerCase();

if (!input) { console.error("Pakai: node scripts/anime-foto.mjs <file-foto> [--gaya anime|ghibli|chibi|kartun] [--cv <slug>]"); process.exit(1); }
if (!key) { console.error("GEMINI_API_KEY belum ada. Dapetin gratis di https://aistudio.google.com/apikey lalu --key <KEY> atau set env."); process.exit(1); }

const FILE = path.resolve(input);
if (!fs.existsSync(FILE)) { console.error("Foto gak ketemu:", FILE); process.exit(1); }

// ---- gaya → prompt ----
const PROMPTS = {
  anime: "Ubah foto ini jadi potret bergaya anime modern yang rapi: garis bersih, shading lembut, warna hangat, background gradasi pastel kuning-lemon halus, wajah tetap mirip orang di foto asli, komposisi kepala-bahu seperti foto profil profesional.",
  ghibli: "Ubah foto ini jadi potret ilustrasi bergaya film animation studio ghibli: cat air lembut, warna natural hangat, background pastel halus, wajah tetap dikenali sebagai orang di foto asli, komposisi foto profil kepala-bahu.",
  chibi: "Ubah foto ini jadi avatar chibi menggemaskan: kepala besar, badan kecil, mata besar bercahaya, garis tegas, warna pastel, background lemon polos.",
  kartun: "Ubah foto ini jadi potret ilustrasi flat/kartun profesional yang bagus: garis rapi warna flat, wajah mirip orang di foto asli, background pastel lembut, gaya ilustrasi startup modern.",
};
const prompt = PROMPTS[gaya] ?? PROMPTS.anime;

// ---- panggil Gemini image edit ----
const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const mime = mimeMap[path.extname(FILE).toLowerCase()] ?? "image/jpeg";
const b64 = fs.readFileSync(FILE).toString("base64");

const body = {
  contents: [{
    parts: [
      { text: prompt },
      { inlineData: { mimeType: mime, data: b64 } },
    ],
  }],
};

console.log("Merakit… (gemini-2.5-flash-image, gaya:", gaya + ")");
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${encodeURIComponent(key)}`,
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
);
const json = await res.json();
if (!res.ok) {
  console.error("API error:", res.status, JSON.stringify(json.error ?? json).slice(0, 500));
  process.exit(1);
}

// ---- ambil inlineData hasil ----
const parts = json.candidates?.[0]?.content?.parts ?? [];
const img = parts.find((p) => p.inlineData?.data);
if (!img) {
  console.error("Model gak balikin gambar. Refusal/termsenang?", JSON.stringify(parts).slice(0, 400));
  process.exit(1);
}

// ---- simpan + (opsional) tempel ke CV ----
const out = `avatar-ai-${crypto.randomUUID().slice(0, 8)}.png`;
const dir = path.join(process.cwd(), "data", "uploads");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, out), Buffer.from(img.inlineData.data, "base64"));
console.log("DISIMPAN:", `data/uploads/${out}`);
console.log("URL CV:", `/api/media/${out}`);

if (ceo) {
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(path.join(process.cwd(), "data", "cv-maker.db"));
  const row = db.prepare("SELECT id, data FROM cvs WHERE slug = ? OR id = ?").get(ceo, ceo);
  if (row) {
    const d = JSON.parse(row.data);
    d.personal.photo = `/api/media/${out}`;
    db.prepare("UPDATE cvs SET data = ? WHERE id = ?").run(JSON.stringify(d), row.id);
    console.log("Ditempel ke CV:", ceo);
  } else console.log("CV tidak ketemu (skip nempel):", ceo);
}
