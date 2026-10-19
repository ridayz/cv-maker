// Kembalikan CV contoh ke published (dipakai saat demo; idempotent)
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/cv-maker.db");
db.prepare("UPDATE cvs SET status='published' WHERE slug = ?").run("rani-frontend-developer");
console.log("Rani published");
