// Pengaturan: profil + preferensi accent global
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import { ACCENTS } from "@/lib/utils";

const ACCENT_DOT: Record<string, string> = {
  lemon: "#f7e94b", lime: "#b7f04d", rose: "#ffa3c0", sky: "#8fd4ff", lav: "#c9b8ff", mint: "#8fe6c4",
};

export default function SettingsPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accent, setAccent] = useState("lime");

  // baca profil dari localStorage (sisi client) + terapkan accent tersimpan
  useEffect(() => {
    setName(localStorage.getItem("cvmaker.name") ?? "");
    setEmail(localStorage.getItem("cvmaker.email") ?? "");
    const saved = localStorage.getItem("cvmaker.accent") ?? "lime";
    setAccent(saved);
    document.documentElement.dataset.accent = saved;
  }, []);

  function save() {
    localStorage.setItem("cvmaker.name", name);
    localStorage.setItem("cvmaker.email", email);
    toast("Pengaturan tersimpan");
  }

  function pickAccent(a: string) {
    setAccent(a);
    document.documentElement.dataset.accent = a;
    localStorage.setItem("cvmaker.accent", a);
  }

  return (
    <div className="fade-up mx-auto max-w-xl">
      <h1 className="text-2xl font-black tracking-tight">Pengaturan</h1>
      <p className="text-sm text-dim">Profil dan preferensi tampilan — disimpan di browser ini.</p>

      <div className="card mt-6 p-5">
        <h2 className="font-bold">Profil</h2>
        <div className="mt-3 space-y-4">
          <div>
            <label className="label">Nama</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@kamu.dev" />
          </div>
          <button className="btn btn-accent" onClick={save}>Simpan Profil</button>
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h2 className="font-bold">Warna Aksen</h2>
        <p className="text-sm text-dim">Biru pastel (5 pilihan) untuk seluruh aplikasi — CV masing-masing punya pilihannya sendiri di editor.</p>
        <div className="mt-3 flex gap-2">
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => pickAccent(a)}
              title={a}
              className={`h-9 w-9 rounded-full transition-transform ${accent === a ? "scale-110 ring-2 ring-white/60" : "opacity-80 hover:opacity-100"}`}
              style={{ background: ACCENT_DOT[a] }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
