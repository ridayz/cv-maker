// Patch sekali: isi foto dummy + sertifikat dummy ke CV yang belum punya
// Jalankan: node scripts/patch-dummy.mjs (dari root cv-maker)
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

if (!fs.existsSync("data/cv-maker.db")) { console.log("db belum ada"); process.exit(0); }
const db = new DatabaseSync("data/cv-maker.db");
const rows = db.prepare("SELECT id, data FROM cvs").all();
let idx = 0;
let patched = 0;
for (const r of rows) {
  const d = JSON.parse(r.data);
  let changed = false;
  if (!d.personal?.photo || d.personal.photo.includes("dummy-avatar")) {
    d.personal.photo = "/avatars/av-" + ((idx++ % 6) + 1) + ".svg";
    changed = true;
  }
  if (!d.certificates?.length) {
    d.certificates = [];
    for (const c of [
      { name: "Belajar Front-End Web", issuer: "Dicoding", year: "2023" },
      { name: "Google UX Design Professional", issuer: "Coursera", year: "2022" },
      { name: "Belajar Back-End Node.js", issuer: "Dicoding", year: "2022" },
      { name: "Java Fundamental", issuer: "Oracle Academy", year: "2021" },
    ]) d.certificates.push({ id: crypto.randomUUID(), ...c });
    changed = true;
  }
  if (changed) {
    db.prepare("UPDATE cvs SET data = ? WHERE id = ?").run(JSON.stringify(d), r.id);
    patched++;
  }
}
console.log(`patched ${patched} CV`);
