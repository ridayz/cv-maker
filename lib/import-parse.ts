// Import CV lama: heuristik dari teks mentah (.txt/.md) → CVData
import type { CVData, CVExperience, CVEducation, CVSkill } from "./types";
import { emptyCv, newId } from "./utils";

/** Pecah teks jadi blok per heading (markdown ###/##/#) */
function splitByHeadings(text: string): { heading: string; lines: string[] }[] {
  const blocks: { heading: string; lines: string[] }[] = [];
  let current = { heading: "", lines: [] as string[] };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const m = line.match(/^#{1,6}\s+(.*)$/); // markdown heading
    const plainHeading = line && line.length <= 40 && /^[A-Z][A-Z\s&/]+$/i.test(line) && /^(Pengalaman|Experience|Pendidikan|Education|Skill|Skills|Keahlian|Ringkasan|Summary|Profil|Profile|Kontak|Contact)/i.test(line);
    if (m?.[1] || plainHeading) {
      if (current.heading || current.lines.length) blocks.push(current);
      current = { heading: (m?.[1] ?? line).toLowerCase(), lines: [] };
    } else if (line) {
      current.lines.push(line);
    }
  }
  if (current.heading || current.lines.length) blocks.push(current);
  return blocks;
}

function classify(heading: string): "summary" | "experience" | "education" | "skills" | "other" {
  if (/(ringkasan|summary|profil|profile|tentang|about)/.test(heading)) return "summary";
  if (/(pengalaman|experience|kerja|work|karrier|career)/.test(heading)) return "experience";
  if (/(pendidikan|education|sekolah|kuliah|school)/.test(heading)) return "education";
  if (/(skill|keahlian|kemampuan|tools)/.test(heading)) return "skills";
  return "other";
}

/** Baris pengalaman: "Frontend Dev — TokoKilat (2022 - Sekarang)" atau "2020 - 2022 | Junior Dev @ Studio" */
function parseExperienceLines(lines: string[]): CVExperience[] {
  const out: CVExperience[] = [];
  let last: CVExperience | null = null;
  for (const line of lines) {
    const header = line.match(/^(.{2,60}?)\s+[—–-]\s+(.{2,50})$/);      // "Role — Company"
    const at = line.match(/^(.{2,60}?)\s+(?:@|di|at)\s+(.{2,50})$/i);   // "Role @ Company"
    const paren = line.match(/^(.{2,60}?)\s*\((.{2,50})\)$/);           // "Role (Company)"
    const period = line.match(/(\d{4})\s*(?:-|–|s\/d|sampai|to)\s*(\d{4}|sekarang|present|now)/i);
    const head = header ?? at ?? paren;
    if (head && !period && head[1].length > 3) {
      last = { id: newId(), role: head[1].trim(), company: head[2].trim(), start: "", end: "", desc: "" };
      out.push(last);
    } else if (period) {
      last = { id: newId(), role: line.replace(/(.*?)(\d{4}.*)?/, "$1").trim() || "", company: "", start: period[1], end: period[2], desc: "" };
      if (!last.role) last.role = "—";
      out.push(last);
    } else if (last) {
      last.desc = (last.desc ? last.desc + " " : "") + line;
    } else if (line.length > 10) {
      // belum ada header → jadikan header sendiri kalau keliatan seperti judul
      last = { id: newId(), role: line.slice(0, 60), company: "", start: "", end: "", desc: "" };
      out.push(last);
    }
  }
  return out;
}

function parseEducationLines(lines: string[]): CVEducation[] {
  const out: CVEducation[] = [];
  let last: CVEducation | null = null;
  for (const line of lines) {
    const period = line.match(/(\d{4})\s*(?:-|–|s\/d|sampai|to)\s*(\d{4}|sekarang|present)/i);
    if (period) {
      last = { id: newId(), school: line.replace(period[0], "").replace(/[—–|-]/g, "").trim(), degree: "", start: period[1], end: period[2], desc: "" };
      out.push(last);
    } else if (last) {
      if (!last.degree && line.length < 80) last.degree = line;
      else last.desc = (last.desc ? last.desc + " " : "") + line;
    } else if (line.length > 5) {
      last = { id: newId(), school: line.slice(0, 80), degree: "", start: "", end: "", desc: "" };
      out.push(last);
    }
  }
  return out;
}

function parseSkills(lines: string[]): CVSkill[] {
  // "React, TypeScript, Figma" atau markdown list "React\nTypeScript"
  const words = lines.join("\n").split(/[,;\n•|]+/).map((s) => s.replace(/^[-*+\s]+/, "").trim()).filter(Boolean);
  return words.slice(0, 30).map((name) => ({ id: newId(), name }));
}

/** Nama = baris berisi teks pertama (bukan email/telepon), email & telp dicari pola umum */
function parsePersonal(text: string): Partial<CVData["personal"]> {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const phone = text.match(/(\+?62|0)[\d\s-]{8,14}/)?.[0]?.trim() ?? "";
  let full_name = "";
  let website = "";
  let address = "";
  for (const line of lines) {
    if (/https?:\/\//.test(line) && !website) website = line.replace(/^.*?(https?:\/\/\S+).*$/, "$1");
    if (/(alamat|address|location|lokasi)/i.test(line) && !address) address = line.replace(/^(alamat|address|location|lokasi)\s*:?\s*/i, "");
    if (line === email || /[\d]{5,}/.test(line)) continue;
    if (!full_name && line.length >= 2 && line.length <= 40 && /^[A-Z][a-zA-Z.]+([ ,][A-Za-z]+)+$/.test(line)) full_name = line;
  }
  return { full_name, email, phone, website, address, headline: "" };
}

export function importCvFromText(text: string): CVData {
  const cv = emptyCv();
  Object.assign(cv.personal, parsePersonal(text));
  const blocks = splitByHeadings(text);
  let unclassified: string[] = [];
  for (const block of blocks) {
    if (!block.heading) { unclassified.push(...block.lines); continue; }
    const kind = classify(block.heading);
    if (kind === "summary") cv.summary = block.lines.join(" ");
    else if (kind === "experience") cv.experiences = parseExperienceLines(block.lines);
    else if (kind === "education") cv.education = parseEducationLines(block.lines);
    else if (kind === "skills") cv.skills = parseSkills(block.lines);
    else unclassified.push(...block.lines);
  }
  // teks tanpa heading sama sekali → coba tebak struktur langsung
  if (!blocks.some((b) => classify(b.heading) !== "other")) {
    cv.summary = unclassified.slice(0, 3).join(" ");
    const rest = unclassified;
    cv.experiences = parseExperienceLines(rest);
    cv.skills = parseSkills(rest.slice(-5));
  }
  if (!cv.accent) cv.accent = "lime";
  return cv;
}
