# CV Maker

Aplikasi web lokal buat bikin CV moderen dengan mudah — UI gelap + aksen pastel, tombol eyecatching, font Geist.

## Menjalankan

```bat
npm install
npm run dev
```

Buka **http://localhost:3901**

- Database SQLite otomatis dibuat di `data/cv-maker.db` (+ seed 1 CV contoh) saat server start pertama kali.
- Butuh Node.js 24+ (pakai `node:sqlite` bawaan — tanpa dependency tambahan).

## Fitur

- **Wizard editor** 5 tab: Identitas, Ringkasan, Pengalaman, Pendidikan, Keahlian — autosave tiap 800ms
- **Live preview** persis halaman publik, di panel kanan editor
- **5 aksen pastel**: lime, rose, sky, lavender, mint — per CV
- **Halaman publik** `/cv/<slug>` + tombol Print → PDF
- **Import CV lama**: paste teks atau file `.txt`/`.md` → parser heuristik (Gabung atau Timpa)
- **Upload foto** dengan resize otomatis di browser (maks 512px, webp)
- **Dashboard**: cari, publish/draft, hapus
- **SEO dasar**: metadata, sitemap, robots
- Draft ≠ publik: CV draft tak terlihat di halaman publik

## Struktur

```
app/            halaman (App Router)
  api/cvs/      CRUD CV
  api/import/   parser teks CV
  api/upload/   simpan foto
  api/media/    sajikan foto
components/     cv-editor, cv-paper, nav, toast, modal, print-button
lib/            db (node:sqlite), import-parse, types, utils
db/schema.sql   skema SQLite
data/           sqlite + uploads (dibuat runtime)
```

## Catatan

- PRD lengkap: `PRD.md`; aturan agent: `AGENTS.md`
- Lokal-only, tanpa auth & admin (user tunggal seed)
