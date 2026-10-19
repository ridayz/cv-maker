import Link from "next/link";
import { listCvs } from "@/lib/db";

// data live dari SQLite → route blocking (bukan prerender statis)
export const instant = false;

export default async function Landing() {
  // contoh CV published pertama (kalau ada) buat showcase
  const items = listCvs();
  const showcase = items.find((c) => c.status === "published") ?? null;

  return (
    <div className="fade-up">
      {/* Hero */}
      <section className="py-10 text-center sm:py-16">
        <span className="chip">✨ 100% lokal & gratis</span>
        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Bikin CV <span style={{ color: "var(--accent-deep)" }}>cantik</span>
          <br className="hidden sm:block" /> dalam beberapa menit.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-dim sm:text-lg">
          Isi form, lihat live preview, tekan print → PDF siap kirim. Ada juga import CV lama
          biar tinggal dirapikan.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard?new=1" className="btn btn-accent !px-6 !py-3 !text-base">
            Mulai Bikin CV →
          </Link>
          {showcase && (
            <Link href={`/cv/${showcase.slug}`} className="btn btn-ghost !px-6 !py-3 !text-base">
              Contoh Hasil
            </Link>
          )}
        </div>
      </section>

      {/* 3 langkah */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { n: "1", t: "Isi Data", d: "Nama, pengalaman, pendidikan, skill — form yang jelas, ada contoh." },
          { n: "2", t: "Pilih Konten & Aksen", d: "5 tema pastel (lime, rose, sky, lavender, mint). Live preview real-time." },
          { n: "3", t: "Print / PDF", d: "Halaman CV publik siap print jadi PDF rapi lewat dialog browser." },
        ].map((s) => (
          <div key={s.n} className="card p-5">
            <div
              className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl font-black"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              {s.n}
            </div>
            <h3 className="font-bold">{s.t}</h3>
            <p className="mt-1 text-sm text-dim">{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
