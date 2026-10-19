// Editor CV — form lengkap (kiri) + live preview (kanan), import CV lama, upload foto
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { CvPaper } from "@/components/cv-paper";
import { ACCENTS, dummyCertificates, emptyCv, newId } from "@/lib/utils";
import type { CVData } from "@/lib/types";

type Item = {
  id: string; title: string; slug: string; status: string; updated_at: string;
  data: CVData;
};

const SECTIONS = ["Identitas", "Ringkasan", "Pengalaman", "Pendidikan", "Sertifikat", "Keahlian"] as const;
type Section = (typeof SECTIONS)[number];

// warna titik pemilih accent (UI editor)
const ACCENT_DOT: Record<string, string> = {
  lemon: "#f7e94b", lime: "#b7f04d", rose: "#ffa3c0", sky: "#8fd4ff", lav: "#c9b8ff", mint: "#8fe6c4",
};

export function CvEditor({ id }: { id: string }) {
  const toast = useToast();
  // galeri avatar lokal (ilustrasi flat, palet mengikuti tema pastel)
  const AVATARS = [
    { file: "av-1.svg", label: "Classic" },
    { file: "av-2.svg", label: "Hijab Rose" },
    { file: "av-3.svg", label: "Kacamata Sky" },
    { file: "av-4.svg", label: "Rambut Panjang Lavender" },
    { file: "av-5.svg", label: "Topi Mint" },
    { file: "av-6.svg", label: "Janggut Lime" },
  ];
  const [cv, setCv] = useState<Item | null>(null);       // null = loading
  const [data, setData] = useState<CVData | null>(null); // data form
  const [section, setSection] = useState<Section>("Identitas");
  const [impOpen, setImpOpen] = useState(false);
  const [impText, setImpText] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- load CV (sekali) ----
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/cvs/${id}`);
      if (!res.ok) { toast("CV tidak ditemukan", "err"); return; }
      const { item } = await res.json();
      setCv(item);
      setData({ ...emptyCv(), ...item.data });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- autosave (debounce 800ms setelah perubahan data) ----
  const save = useCallback(
    async (patch: Partial<{ title: string; data: CVData }>) => {
      setSaving(true);
      const res = await fetch(`/api/cvs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSaving(false);
      if (res.ok) {
        const { item } = await res.json();
        setCv(item);
        return item;
      }
      toast("Gagal menyimpan", "err");
      return null;
    },
    [id, toast]
  );

  useEffect(() => {
    if (!data || !cv) return;
    const t = setTimeout(() => save({ title: cv.title, data }), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ---- generik: set field personal ----
  function setPersonal<K extends keyof CVData["personal"]>(key: K, v: string) {
    setData((d) => d && { ...d, personal: { ...d.personal, [key]: v } });
  }

  // ---- IMPORT: paste teks / file .txt .md → parser → data ----
  async function doImport(merge: boolean) {
    if (!impText.trim()) { toast("Tempel teks CV dulu", "err"); return; }
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: impText }),
    });
    if (!res.ok) { toast("Import gagal", "err"); return; }
    const { data: parsed } = await res.json();
    setData((d) => {
      if (!d) return d;
      if (merge) {
        // gabung: hanya isi field yang masih kosong
        return {
          ...d,
          personal: {
            full_name: d.personal.full_name || parsed.personal.full_name,
            headline: d.personal.headline || parsed.personal.headline,
            email: d.personal.email || parsed.personal.email,
            phone: d.personal.phone || parsed.personal.phone,
            address: d.personal.address || parsed.personal.address,
            website: d.personal.website || parsed.personal.website,
            photo: d.personal.photo,
          },
          summary: d.summary || parsed.summary,
          experiences: d.experiences.length ? d.experiences : parsed.experiences,
          education: d.education.length ? d.education : parsed.education,
          skills: d.skills.length ? d.skills : parsed.skills,
        };
      }
      // timpa: foto & accent lama tetap dipertahankan
      return { ...parsed, accent: d.accent, personal: { ...parsed.personal, photo: d.personal.photo } };
    });
    setImpOpen(false);
    setImpText("");
    setSection("Identitas");
    toast("CV terimport — cek & rapikan ya");
  }

  // ---- generate avatar (API → disimpen lokal) ----
  async function genAvatar() {
    const styles = ["dylan", "notion", "lorelei", "adventurer", "personas", "micah", "big-smile"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    try {
      const res = await fetch(`/api/avatar?style=${style}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setPersonal("photo", j.url);
      toast(`Avatar baru: ${style}`);
    } catch {
      toast("Generate avatar gagal — cek koneksi", "err");
    }
  }

  // ---- upload foto (client resize → server save) ----
  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast("Harus PNG/JPG/WebP", "err"); return;
    }
    try {
      // resize sisi client pakai canvas: sisi terpanjang maks 512px → webp
      const img = await new Promise<HTMLImageElement>((ok, err) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = err;
        i.src = URL.createObjectURL(file);
      });
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.85));
      if (!blob) throw new Error("resize gagal");
      const fd = new FormData();
      fd.append("file", new File([blob], "photo.webp", { type: "image/webp" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPersonal("photo", `/api/media/${json.name}`);
      toast("Foto terpasang");
    } catch {
      toast("Upload foto gagal", "err");
    }
  }

  function addSkill(name: string) {
    const v = name.trim();
    if (!v) return;
    setData((d) => d && { ...d, skills: [...d.skills, { id: newId(), name: v }] });
  }

  if (!cv || !data) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-96" />
        <div className="skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="fade-up">
      {/* Bar atas: kembali, judul editable, status, save */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href="/dashboard" className="btn btn-ghost text-xs">← Dashboard</Link>
        <input
          className="input max-w-md flex-1 font-bold"
          value={cv.title}
          onChange={(e) => setCv((c) => c && { ...c, title: e.target.value })}
          onBlur={() => save({ title: cv.title, data })}
        />
        <span className={cv.status === "published" ? "chip" : "chip chip-dim"}>
          {cv.status === "published" ? "🟢 publik" : "🖊 draft"}
        </span>
        <span className="text-xs text-dim">{saving ? "menyimpan…" : "tersimpan ✓"}</span>
        {cv.status === "published" && (
          <a href={`/cv/${cv.slug}`} target="_blank" className="btn btn-ghost text-xs" rel="noreferrer">👁 Lihat publik</a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ================= FORM (kiri) ================= */}
        <form onSubmit={(e) => e.preventDefault()} className="card p-5">
          {/* tab section */}
          <div className="mb-4 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                style={
                  section === s
                    ? { background: "var(--accent)", color: "var(--accent-ink)" }
                    : { background: "var(--bg-softer)", color: "var(--text-dim)" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          {section === "Identitas" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {data.personal.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.personal.photo} alt="foto" className="h-20 w-20 rounded-2xl object-cover" style={{ border: "2px solid var(--accent)" }} />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl" style={{ background: "var(--bg-softer)" }}>🧑</div>
                )}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-accent text-xs" onClick={genAvatar} title="Random avatar baru">
                      🎲 Generate Avatar
                    </button>
                    <button type="button" className="btn btn-ghost text-xs" onClick={() => fileRef.current?.click()}>📁 Upload foto</button>
                    {data.personal.photo && (
                      <button type="button" className="btn btn-ghost text-xs" onClick={() => setPersonal("photo", "")}>Hapus foto</button>
                    )}
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPhoto} />
                  </div>
                  {/* galeri avatar lokal — tinggal klik, tanpa upload */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-dim">Avatar:</span>
                    {AVATARS.map((a) => (
                      <button
                        key={a.file}
                        type="button"
                        onClick={() => setPersonal("photo", `/avatars/${a.file}`)}
                        title={a.label}
                        className={`overflow-hidden rounded-lg transition-transform ${data.personal.photo === `/avatars/${a.file}` ? "scale-110 ring-2 ring-black/50" : "opacity-80 hover:opacity-100"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/avatars/${a.file}`} alt={a.label} className="h-9 w-9" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Nama lengkap</label>
                <input className="input" value={data.personal.full_name} onChange={(e) => setPersonal("full_name", e.target.value)} placeholder="cth: Rani Putri Ayu" />
              </div>
              <div>
                <label className="label">Headline / posisi</label>
                <input className="input" value={data.personal.headline} onChange={(e) => setPersonal("headline", e.target.value)} placeholder="cth: Frontend Developer" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={data.personal.email} onChange={(e) => setPersonal("email", e.target.value)} placeholder="nama@email.com" />
                </div>
                <div>
                  <label className="label">Telepon</label>
                  <input className="input" value={data.personal.phone} onChange={(e) => setPersonal("phone", e.target.value)} placeholder="0812-3456-7890" />
                </div>
                <div>
                  <label className="label">Alamat / lokasi</label>
                  <input className="input" value={data.personal.address} onChange={(e) => setPersonal("address", e.target.value)} placeholder="cth: Bandung, Indonesia" />
                </div>
                <div>
                  <label className="label">Website / LinkedIn</label>
                  <input className="input" value={data.personal.website} onChange={(e) => setPersonal("website", e.target.value)} placeholder="https://…" />
                </div>
              </div>
            </div>
          )}

          {section === "Ringkasan" && (
            <div>
              <label className="label">Ringkasan profesional (2–4 kalimat)</label>
              <textarea
                className="input min-h-40"
                value={data.summary}
                onChange={(e) => setData((d) => d && { ...d, summary: e.target.value })}
                placeholder="Ceritakan singkat: pengalaman total, keahlian utama, dan nilai yang kamu bawa…"
              />
            </div>
          )}

          {section === "Pengalaman" && (
            <div className="space-y-4">
              {data.experiences.map((exp, i) => (
                <div key={exp.id} className="rounded-xl p-4" style={{ background: "var(--bg-softer)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="chip chip-dim">#{i + 1}</span>
                    <button
                      type="button"
                      className="text-xs text-dim hover:text-danger"
                      onClick={() => setData((d) => d && { ...d, experiences: d.experiences.filter((x) => x.id !== exp.id) })}
                    >
                      🗑 hapus
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Posisi</label>
                      <input className="input" value={exp.role} onChange={(e) => setData((d) => d && { ...d, experiences: d.experiences.map((x) => x.id === exp.id ? { ...x, role: e.target.value } : x) })} />
                    </div>
                    <div>
                      <label className="label">Perusahaan</label>
                      <input className="input" value={exp.company} onChange={(e) => setData((d) => d && { ...d, experiences: d.experiences.map((x) => x.id === exp.id ? { ...x, company: e.target.value } : x) })} />
                    </div>
                    <div>
                      <label className="label">Mulai</label>
                      <input className="input" value={exp.start} onChange={(e) => setData((d) => d && { ...d, experiences: d.experiences.map((x) => x.id === exp.id ? { ...x, start: e.target.value } : x) })} placeholder="2022" />
                    </div>
                    <div>
                      <label className="label">Sampai</label>
                      <input className="input" value={exp.end} onChange={(e) => setData((d) => d && { ...d, experiences: d.experiences.map((x) => x.id === exp.id ? { ...x, end: e.target.value } : x) })} placeholder="Sekarang" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="label">Deskripsi</label>
                    <textarea className="input min-h-20" value={exp.desc} onChange={(e) => setData((d) => d && { ...d, experiences: d.experiences.map((x) => x.id === exp.id ? { ...x, desc: e.target.value } : x) })} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setData((d) => d && { ...d, experiences: [...d.experiences, { id: newId(), role: "", company: "", start: "", end: "", desc: "" }] })}
              >
                + Tambah Pengalaman
              </button>
            </div>
          )}

          {section === "Pendidikan" && (
            <div className="space-y-4">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="rounded-xl p-4" style={{ background: "var(--bg-softer)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="chip chip-dim">#{i + 1}</span>
                    <button
                      type="button"
                      className="text-xs text-dim hover:text-danger"
                      onClick={() => setData((d) => d && { ...d, education: d.education.filter((x) => x.id !== edu.id) })}
                    >
                      🗑 hapus
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label">Sekolah / Kampus</label>
                      <input className="input" value={edu.school} onChange={(e) => setData((d) => d && { ...d, education: d.education.map((x) => x.id === edu.id ? { ...x, school: e.target.value } : x) })} />
                    </div>
                    <div>
                      <label className="label">Jurusan / gelar</label>
                      <input className="input" value={edu.degree} onChange={(e) => setData((d) => d && { ...d, education: d.education.map((x) => x.id === edu.id ? { ...x, degree: e.target.value } : x) })} />
                    </div>
                    <div>
                      <label className="label">Mulai</label>
                      <input className="input" value={edu.start} onChange={(e) => setData((d) => d && { ...d, education: d.education.map((x) => x.id === edu.id ? { ...x, start: e.target.value } : x) })} placeholder="2016" />
                    </div>
                    <div>
                      <label className="label">Sampai</label>
                      <input className="input" value={edu.end} onChange={(e) => setData((d) => d && { ...d, education: d.education.map((x) => x.id === edu.id ? { ...x, end: e.target.value } : x) })} placeholder="2020" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="label">Catatan (opsional)</label>
                    <input className="input" value={edu.desc} onChange={(e) => setData((d) => d && { ...d, education: d.education.map((x) => x.id === edu.id ? { ...x, desc: e.target.value } : x) })} />
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setData((d) => d && { ...d, education: [...d.education, { id: newId(), school: "", degree: "", start: "", end: "", desc: "" }] })}
              >
                + Tambah Pendidikan
              </button>
            </div>
          )}

          {section === "Sertifikat" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-dim">Sertihan/kursus/pelatihan yang kamu lulusi.</p>
                <button
                  type="button"
                  className="btn btn-ghost text-xs"
                  onClick={() => setData((d) => d && { ...d, certificates: [...d.certificates, ...dummyCertificates()] })}
                >
                  🎲 Isi dummy
                </button>
              </div>
              {data.certificates.map((cer, i) => (
                <div key={cer.id} className="rounded-xl p-4" style={{ background: "var(--bg-softer)" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="chip chip-dim">#{i + 1}</span>
                    <button
                      type="button"
                      className="text-xs text-dim hover:text-danger"
                      onClick={() => setData((d) => d && { ...d, certificates: d.certificates.filter((x) => x.id !== cer.id) })}
                    >
                      🗑 hapus
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="label">Nama sertifikat</label>
                      <input className="input" value={cer.name} onChange={(e) => setData((d) => d && { ...d, certificates: d.certificates.map((x) => x.id === cer.id ? { ...x, name: e.target.value } : x) })} placeholder="cth: Belajar Front-End Web" />
                    </div>
                    <div>
                      <label className="label">Penerbit</label>
                      <input className="input" value={cer.issuer} onChange={(e) => setData((d) => d && { ...d, certificates: d.certificates.map((x) => x.id === cer.id ? { ...x, issuer: e.target.value } : x) })} placeholder="cth: Dicoding" />
                    </div>
                    <div>
                      <label className="label">Tahun</label>
                      <input className="input" value={cer.year} onChange={(e) => setData((d) => d && { ...d, certificates: d.certificates.map((x) => x.id === cer.id ? { ...x, year: e.target.value } : x) })} placeholder="2023" />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setData((d) => d && { ...d, certificates: [...d.certificates, { id: newId(), name: "", issuer: "", year: "" }] })}
              >
                + Tambah Sertifikat
              </button>
            </div>
          )}

          {section === "Keahlian" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s) => (
                  <span key={s.id} className="chip">
                    {s.name}
                    <button
                      type="button"
                      className="ml-1 opacity-60 hover:opacity-100"
                      onClick={() => setData((d) => d && { ...d, skills: d.skills.filter((x) => x.id !== s.id) })}
                      aria-label={`hapus ${s.name}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  id="skill-input"
                  className="input"
                  placeholder="cth: React"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    const el = document.getElementById("skill-input") as HTMLInputElement | null;
                    if (!el) return;
                    addSkill(el.value);
                    el.value = "";
                  }}
                >
                  + Tambah
                </button>
              </div>
              <p className="text-xs text-dim">Tekan <b>Enter</b> atau tombol "+ Tambah".</p>
            </div>
          )}

          {/* aksi bawah form: import */}
          <div className="mt-5 border-t border-line pt-4">
            <button type="button" className="btn btn-ghost text-xs" onClick={() => setImpOpen(true)}>
              📥 Import CV lama
            </button>
          </div>
        </form>

        {/* ================= PREVIEW (kanan) ================= */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Live Preview</span>
            <div className="ml-auto flex gap-1.5">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setData((d) => d && { ...d, accent: a })}
                  title={a}
                  className={`h-7 w-7 rounded-full transition-transform ${data.accent === a ? "scale-110 ring-2 ring-black/50" : "opacity-80 hover:opacity-100"}`}
                  style={{ background: ACCENT_DOT[a] }}
                />
              ))}
            </div>
          </div>
          <div className="no-print sticky top-20" data-accent={data.accent || "lime"}>
            <div className="card overflow-hidden">
              <CvPaper cv={data} />
            </div>
            <p className="mt-2 text-xs text-dim">
              Preview persis halaman publik. Publikasikan dulu, buka halaman publiknya, lalu 🖨 Print / PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Modal import */}
      <Modal open={impOpen} onClose={() => setImpOpen(false)} title="Import CV Lama">
        <p className="text-sm text-dim">
          Tempel teks CV lama, atau upload file <b>.txt</b> / <b>.md</b>. Parser akan menata
          jadi form — kamu tinggal merapikan.
        </p>
        <input
          type="file"
          accept=".txt,.md,.markdown,text/plain"
          className="input mt-3"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setImpText(await f.text());
          }}
        />
        <textarea
          className="input mt-3 min-h-36 font-mono text-xs"
          placeholder={"Rani Putri Ayu\nrani@example.com\n\nPENGALAMAN\nFrontend Dev — TokoKilat (2022 - Sekarang)\nMenjaga design system…\n\nPENDIDIKAN\n…\n\nSKILL\nReact, TypeScript"}
          value={impText}
          onChange={(e) => setImpText(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setImpOpen(false)}>Batal</button>
          <button type="button" className="btn btn-ghost" onClick={() => doImport(true)}>Gabung</button>
          <button type="button" className="btn btn-accent" onClick={() => doImport(false)}>Timpa (Import)</button>
        </div>
      </Modal>
    </div>
  );
}
