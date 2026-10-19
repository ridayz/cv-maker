# PRD — CV Maker

> Sumber kebenaran proyek ini. Ide: aplikasi web CV maker yang memudahkan orang bikin CV,
> UI moderen + pastel, tombol eyecatching, font nyaman dibaca.

## 1. Apa yang Dibangun
App web kecil-kecilan tapi end-to-end: bikin CV via form editor + live preview,
ekspor/print ke PDF, import CV lama buat dirapikan. Jalan 100% lokal.

## 2. Stack
- Next.js (App Router) + Tailwind v4
- SQLite via `node:sqlite` (bawaan Node 24, tanpa dependency tambahan)
- Lokal, tanpa auth/admin — user tunggal bawaan (seed)

## 3. Fitur (urut prioritas)
1. Halaman publik: landing hero, list CV, halaman CV publik per-slug (peka status draft/published)
2. Editor CV: form lengkap (identitas, ringkasan, pengalaman, pendidikan, skill, foto) + live preview
3. Import CV lama (paste teks / upload .txt/.md → parser heuristik)
4. SEO dasar: metadata + sitemap + robots
5. Upload foto + optimasi ukuran (resize canvas di client, maks 512px)

## 4. Halaman / Screen
- `/` Landing: hero + CTA
- `/dashboard` List CV + pencarian + aksi
- `/dashboard/cv/[id]` Editor (form kiri, preview kanan)
- `/cv/[slug]` Halaman publik CV + tombol print/PDF
- `/settings` Profil + preferensi accent

## 5. Data Model
- `users(id, name, email, role, created_at)`
- `cvs(id, user_id, title, slug, body, data(JSON), status, created_at, updated_at)`
- `events(id, user_id, action, at)`
- Adaptasi: `items` di PRD starter dipetakan jadi `cvs` (item utama app = CV).

## 6. Fase
- Phase 1 Core: skeleton + styling dasar (dark + pastel accent), schema, data layer
- Phase 2: CRUD API + editor + halaman publik
- Phase 3: settings, import CV lama, upload foto, SEO, polish

## 7. UX
- Dark dominant, aksen pastel (lime/rose/sky/lav/mint)
- Feedback tiap aksi (toast/skeleton), keyboard: Enter submit, Esc tutup modal
- Font: Geist (sans) + system stack fallback

## 8. Catatan Asumsi
- Port dev: 3901 (hindari port app lain di mesin ini)
- Tanpa auth: user tunggal lokal `local-user`
- Import: heuristik teks (.txt/.md), PDF parsing tidak discope (backlog)
- Foto disimpan di `data/uploads`, disajikan via `/api/media/<nama>` (aman untuk dev & build)
