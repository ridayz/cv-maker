// Render kertas CV gaya template premium — dipakai live preview editor & halaman publik
import type { CVData } from "@/lib/types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em]"
      style={{ color: "var(--accent-deep)" }}
    >
      <span className="inline-block h-3 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
      {children}
    </h2>
  );
}

function Period({ start, end }: { start: string; end: string }) {
  if (!start && !end) return null;
  return <span className="text-xs opacity-70">{[start, end].filter(Boolean).join(" – ")}</span>;
}

export function CvPaper({ cv }: { cv: CVData }) {
  const p = cv.personal;
  const initial = (p.full_name || "CV").trim().charAt(0).toUpperCase();
  return (
    <div className="cv-paper overflow-hidden">
      {/* band accent di atas */}
      <div
        className="h-2.5 w-full"
        style={{ background: "linear-gradient(90deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 40%, #ffffff) 100%)" }}
      />
      <div className="relative">
        {/* lingkaran dekor lembut di pojok */}
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
          style={{ background: "var(--accent)", opacity: 0.1 }}
        />
        <div className="relative p-6 sm:p-9">
          {/* kepala: foto + nama + headline */}
          <header className="flex items-center gap-5">
            {p.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photo}
                alt={p.full_name}
                className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                style={{ border: "3px solid var(--accent)", boxShadow: "0 8px 20px -10px var(--accent)" }}
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black sm:h-28 sm:w-28"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 45%, #ffffff) 100%)",
                  color: "var(--accent-ink)",
                }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-[34px]">
                {p.full_name || "Nama Anda"}
              </h1>
              {p.headline && (
                <p className="mt-1 text-base font-semibold" style={{ color: "var(--accent-deep)" }}>
                  {p.headline}
                </p>
              )}
            </div>
          </header>

          {/* badan: sidebar kontak/skill/sertifikat + kolom utama */}
          <div className="mt-8 grid gap-8" style={{ gridTemplateColumns: "minmax(240px, 34%) 1fr" }}>
            {/* ====== sidebar tinted ====== */}
            <aside
              className="self-start rounded-2xl p-5"
              style={{ background: "color-mix(in srgb, var(--accent) 18%, #fbfbf7)" }}
            >
              {(p.email || p.phone || p.address || p.website) && (
                <div className="mb-5">
                  <SectionTitle>Kontak</SectionTitle>
                  <ul className="space-y-2 text-sm">
                    {p.email && <li className="flex gap-2"><span>✉️</span><span className="min-w-0 break-all">{p.email}</span></li>}
                    {p.phone && <li className="flex gap-2"><span>📞</span><span>{p.phone}</span></li>}
                    {p.address && <li className="flex gap-2"><span>📍</span><span>{p.address}</span></li>}
                    {p.website && (
                      <li className="flex gap-2">
                        <span>🔗</span>
                        <span className="min-w-0 break-all" style={{ color: "var(--accent-deep)" }}>{p.website}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {cv.skills.length > 0 && (
                <div className="mb-5">
                  <SectionTitle>Keahlian</SectionTitle>
                  <ul className="flex flex-wrap gap-1.5">
                    {cv.skills.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cv.certificates.length > 0 && (
                <div>
                  <SectionTitle>Sertifikasi</SectionTitle>
                  <ul className="space-y-2.5 text-sm">
                    {cv.certificates.map((c) => (
                      <li key={c.id}>
                        <p className="font-bold leading-snug">{c.name}</p>
                        <p className="text-xs opacity-70">
                          {[c.issuer, c.year].filter(Boolean).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* ====== kolom utama ====== */}
            <main className="min-w-0 space-y-6">
              {cv.summary && (
                <section>
                  <SectionTitle>Ringkasan</SectionTitle>
                  <p className="text-[15px] leading-relaxed opacity-90">{cv.summary}</p>
                </section>
              )}

              {cv.experiences.length > 0 && (
                <section>
                  <SectionTitle>Pengalaman</SectionTitle>
                  <ul className="space-y-4">
                    {cv.experiences.map((e) => (
                      <li key={e.id} className="relative pl-6">
                        <span
                          className="absolute left-0 top-[6px] h-3.5 w-3.5 rounded-full"
                          style={{
                            background: "var(--accent)",
                            boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)",
                          }}
                        />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="font-bold">
                            {e.role}
                            {e.company ? <span className="opacity-80"> — {e.company}</span> : null}
                          </p>
                          <Period start={e.start} end={e.end} />
                        </div>
                        {e.desc && <p className="mt-1 text-sm opacity-85">{e.desc}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {cv.education.length > 0 && (
                <section>
                  <SectionTitle>Pendidikan</SectionTitle>
                  <ul className="space-y-3">
                    {cv.education.map((e) => (
                      <li key={e.id} className="relative pl-6">
                        <span
                          className="absolute left-0 top-[6px] h-3.5 w-3.5 rounded-full"
                          style={{
                            background: "color-mix(in srgb, var(--accent) 70%, #ffffff)",
                            boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent)",
                          }}
                        />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="font-bold leading-snug">
                            {e.degree || e.school}
                            {e.degree && e.school ? <span className="text-sm opacity-75"> · {e.school}</span> : null}
                          </p>
                          <Period start={e.start} end={e.end} />
                        </div>
                        {e.desc && <p className="mt-0.5 text-sm opacity-85">{e.desc}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
