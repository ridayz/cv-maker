# Aturan Agent AI — CV Maker

## 1. Sumber Kebenaran
- `PRD.md` di root = sumber kebenaran utama. Baca dulu SEBELUM ngoding.
- Konflik PRD vs permintaan lisan: tanya user mana yang menang.

## 2. Cara Mulai (MODE PRO: ZERO TANYA)
- EKSEKUSI LANGSUNG, tanpa nanya. Ambigu → pilih opsi paling masuk akal & aman.
- Semua asumsi dicatat di blok "Catatan Asumsi" (lihat PRD.md §8).

## 3. Cara Kerja
- Per fase (PRD.md §6). Satu fase = selesai + uji + lapor, baru lanjut.
- Tiap file selesai: cek syntax & import. Tiap fitur selesai: uji alurnya.
- Error dicampak sampai selesai; fix root cause, bukan tambal. Gagal 2x di masalah sama: berhenti, minta arahan.

## 4. Aturan Kode
- Comments bahasa Indonesia, nama variabel bahasa Inggris.
- Jangan tambah dependency baru tanpa izin. Simpel dulu, baru optimal.

## 5. Definition of Done
- Jalan tanpa error end-to-end; empty/loading/error state terhandle; laporan singkat per fase.

## 6. Perintah
- Dev: `npm run dev` → http://localhost:3901
- DB SQLite: `data/cv-maker.db` (dibuat otomatis + seed saat server start)

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
