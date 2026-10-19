// Data layer — SQLite via node:sqlite (bawaan Node 24, tanpa dependency)
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { CVData } from "./types";
import { emptyCv, newId, sampleCv, slugify } from "./utils";

let _db: DatabaseSync | null = null;

function openDb(): DatabaseSync {
  if (_db) return _db;
  // folder data/ dibuat kalau belum ada (db + uploads)
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "cv-maker.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  // schema: jalankan file db/schema.sql
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  db.exec(fs.readFileSync(schemaPath, "utf8"));
  // seed: user tunggal + 1 CV contoh (hanya saat kosong)
  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (userCount.n === 0) {
    db.prepare("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)").run(
      newId(), "Local User", "local@user.dev", "owner"
    );
    const row = db.prepare("SELECT id FROM users LIMIT 1").get() as { id: string };
    db.prepare("INSERT INTO cvs (id, user_id, title, slug, body, data, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      newId(), row.id, "Rani — Frontend Developer", slugify("Rani — Frontend Developer"),
      "", JSON.stringify(sampleCv()), "published"
    );
  }
  _db = db;
  return db;
}

function logEvent(action: string, userId?: string) {
  try {
    openDb().prepare("INSERT INTO events (user_id, action) VALUES (?, ?)").run(userId ?? null, action);
  } catch { // event log gagal tidak boleh bikin request gagal
  }
}

function getUser(): { id: string } {
  return openDb().prepare("SELECT id FROM users LIMIT 1").get() as { id: string };
}

function genUniqueSlug(title: string, excludeId?: string): string {
  const db = openDb();
  const base = slugify(title);
  let slug = base;
  let i = 2;
  while (true) {
    const found = excludeId
      ? db.prepare("SELECT id FROM cvs WHERE slug = ? AND id != ?").get(slug, excludeId)
      : db.prepare("SELECT id FROM cvs WHERE slug = ?").get(slug);
    if (!found) return slug;
    slug = `${base}-${i++}`;
  }
}

export type CVRow = {
  id: string; user_id: string; title: string; slug: string;
  body: string; data: string; status: string;
  created_at: string; updated_at: string;
};

export function parseCv(row: CVRow) {
  let data: CVData;
  try {
    data = { ...emptyCv(), ...(JSON.parse(row.data) as CVData) };
  } catch {
    data = emptyCv();
  }
  return { ...row, data };
}

export function listCvs(q?: string) {
  const db = openDb();
  const rows = (
    q
      ? db.prepare("SELECT * FROM cvs WHERE title LIKE ? ORDER BY datetime(updated_at) DESC").all(`%${q}%`)
      : db.prepare("SELECT * FROM cvs ORDER BY datetime(updated_at) DESC").all()
  ) as unknown as CVRow[];
  return rows.map(parseCv);
}

export function getCv(id: string): ReturnType<typeof parseCv> | null {
  const row = openDb().prepare("SELECT * FROM cvs WHERE id = ?").get(id) as CVRow | undefined;
  return row ? parseCv(row) : null;
}

export function getCvBySlug(slug: string, allowDraft = false): ReturnType<typeof parseCv> | null {
  const stmt = allowDraft
    ? openDb().prepare("SELECT * FROM cvs WHERE slug = ?")
    : openDb().prepare("SELECT * FROM cvs WHERE slug = ? AND status = 'published'");
  const row = stmt.get(slug) as CVRow | undefined;
  return row ? parseCv(row) : null;
}

export function createCv(input: { title: string }): ReturnType<typeof parseCv> {
  const db = openDb();
  const user = getUser();
  const id = newId();
  const title = input.title.trim() || "CV Tanpa Nama";
  db.prepare("INSERT INTO cvs (id, user_id, title, slug, body, data, status) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    id, user.id, title, genUniqueSlug(title), "", JSON.stringify(emptyCv()), "draft"
  );
  logEvent("cv.create", user.id);
  return parseCv(db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as CVRow);
}

export function updateCv(id: string, patch: Partial<{ title: string; data: CVData; status: string; body: string }>): ReturnType<typeof parseCv> | null {
  const db = openDb();
  const existing = db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as CVRow | undefined;
  if (!existing) return null;
  const title = patch.title !== undefined ? patch.title.trim() || "CV Tanpa Nama" : existing.title;
  const slug = genUniqueSlug(title, id);
  const data = patch.data !== undefined ? JSON.stringify(patch.data) : existing.data;
  const status = patch.status !== undefined ? patch.status : existing.status;
  const body = patch.body !== undefined ? patch.body : existing.body;
  db.prepare(
    "UPDATE cvs SET title = ?, slug = ?, data = ?, status = ?, body = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(title, slug, data, status, body, id);
  logEvent(`cv.update:${status}`, existing.user_id);
  return parseCv(db.prepare("SELECT * FROM cvs WHERE id = ?").get(id) as CVRow);
}

export function deleteCv(id: string): boolean {
  const db = openDb();
  const info = db.prepare("DELETE FROM cvs WHERE id = ?").run(id);
  if (info.changes > 0) logEvent("cv.delete");
  return info.changes > 0;
}
