// Sidebar hitam (outer) — navigasi global (client, pakai usePathname)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Pengaturan" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <aside className="no-print sidebar">
      <Link href="/" className="mb-5 flex items-center gap-2 font-extrabold tracking-tight">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          CV
        </span>
        CV&nbsp;Maker
      </Link>
      <nav className="flex flex-col gap-1">
        {LINKS.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={`slink ${active ? "active" : ""}`}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="no-print mt-auto">
        <Link href="/dashboard?new=1" className="btn btn-accent w-full">
          + CV Baru
        </Link>
        <p className="no-print mt-3 text-center text-[11px] text-[#9aa3b2]">100% lokal · data di mesinmu</p>
      </div>
    </aside>
  );
}
