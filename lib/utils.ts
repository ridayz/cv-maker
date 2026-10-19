import type { CVData } from "./types";

/** id acak (dipakai client & server) */
export function newId(): string {
  return crypto.randomUUID();
}

/** judul → slug url yang aman */
export function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return base || "cv";
}

/** 'YYYY-MM-DD HH:MM:SS' sqlite (UTC) → tanggal Indonesia pendek */
export function formatTanggal(sqlite: string): string {
  if (!sqlite) return "";
  const d = new Date(sqlite.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return sqlite;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** daftar accent pastel yang tersedia */
export const ACCENTS = ["lemon", "lime", "rose", "sky", "lav", "mint"] as const;

/** kerangka CV kosong */
export function emptyCv(): CVData {
  return {
    personal: {
      full_name: "",
      headline: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      photo: "",
    },
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    certificates: [],
    accent: "lemon",
  };
}

/** Sertifikat dummy (contoh), dipakai tombol 🎲 di editor */
export function dummyCertificates() {
  return [
    { id: newId(), name: "Belajar Front-End Web", issuer: "Dicoding", year: "2023" },
    { id: newId(), name: "Google UX Design Professional", issuer: "Coursera", year: "2022" },
    { id: newId(), name: "Belajar Back-End Node.js", issuer: "Dicoding", year: "2022" },
    { id: newId(), name: "Java Fundamental", issuer: "Oracle Academy", year: "2021" },
  ];
}

/** CV contoh buat seed & showcase landing */
export function sampleCv(): CVData {
  return {
    personal: {
      full_name: "Rani Putri Ayu",
      headline: "Frontend Developer",
      email: "rani@example.com",
      phone: "0812-3456-7890",
      address: "Bandung, Indonesia",
      website: "https://github.com/rani",
      photo: "/dummy-avatar.svg",
    },
    summary:
      "Frontend developer 4+ tahun dengan fokus pada aksesibilitas dan pengalaman pengguna. Suka membangun UI yang rapi, cepat, dan menyenangkan dipakai.",
    experiences: [
      {
        id: newId(),
        role: "Frontend Developer",
        company: "TokoKilat",
        start: "2022",
        end: "Sekarang",
        desc: "Membangun design system internal; memotong waktu rilis fitur baru 40%.",
      },
      {
        id: newId(),
        role: "Junior Web Developer",
        company: "Studio Pixel",
        start: "2020",
        end: "2022",
        desc: "Mengerjakan 15+ website klien dari mockup sampai deploy.",
      },
    ],
    education: [
      {
        id: newId(),
        school: "Universitas Pasundan",
        degree: "S1 Teknik Informatika",
        start: "2016",
        end: "2020",
        desc: "Skripsi: visualisasi data interaktif untuk dashboard UMKM.",
      },
    ],
    skills: [
      { id: newId(), name: "React" },
      { id: newId(), name: "TypeScript" },
      { id: newId(), name: "Tailwind CSS" },
      { id: newId(), name: "Figma" },
      { id: newId(), name: "Next.js" },
    ],
    certificates: [
      { id: newId(), name: "Belajar Front-End Web", issuer: "Dicoding", year: "2023" },
      { id: newId(), name: "Google UX Design Professional", issuer: "Coursera", year: "2022" },
    ],
    accent: "lime",
  };
}
