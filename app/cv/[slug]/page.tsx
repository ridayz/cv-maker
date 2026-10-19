// Halaman publik satu CV + print → PDF
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCvBySlug } from "@/lib/db";
import { CvPaper } from "@/components/cv-paper";
import { PrintButton } from "@/components/print-button";

// data live dari SQLite → route blocking (bukan prerender statis)
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cv = getCvBySlug(slug) ?? getCvBySlug(slug, true);
  if (!cv) return { title: "CV tidak ditemukan" };
  return {
    title: `${cv.data.personal.full_name || cv.title} — CV`,
    description: cv.data.summary || `CV ${cv.data.personal.full_name || cv.title}`,
  };
}

export default async function PublicCvPage({ params }: Props) {
  const { slug } = await params;
  // draft tetap boleh dilihat pemilik (lokal-only) — cuma ditandai, publish biar "resmi"
  const cv = getCvBySlug(slug) ?? getCvBySlug(slug, true);
  if (!cv) notFound();
  const isDraft = cv.status !== "published";
  return (
    <div className="fade-up mx-auto max-w-3xl" data-accent={cv.data.accent || "lime"}>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <a href="/dashboard" className="text-sm text-dim hover:text-ink">← Dashboard</a>
        <div className="flex items-center gap-3">
          {isDraft && <span className="chip" style={{ background: "var(--bg-softer)" }}>🖊 masih draft</span>}
          {!isDraft && <PrintButton />}
        </div>
      </div>
      {isDraft && (
        <div className="mb-4 rounded-xl border border-dashed border-line p-4 text-sm text-dim">
          CV ini <b>belum dipublikasikan</b> — publikasikan dari dashboard biar tombol Print/PDF
          aktif & tercantum di sitemap.
        </div>
      )}
      <div className="card overflow-hidden shadow-2xl">
        <CvPaper cv={cv.data} />
      </div>
      {!isDraft && (
        <p className="no-print mt-3 text-center text-xs text-dim">
          Tips: di dialog print, pilih <b>Save as PDF</b> & matikan "Headers and footers".
        </p>
      )}
    </div>
  );
}
