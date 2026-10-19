// Dashboard: list CV + pencarian + aksi (buka editor, lihat publik, publish, hapus)
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { formatTanggal } from "@/lib/utils";

type Item = {
  id: string; title: string; slug: string; status: string;
  updated_at: string; data: { personal?: { full_name?: string } };
};

export function DashboardList() {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null); // null = loading
  const [q, setQ] = useState("");
  const [delTarget, setDelTarget] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const autosCreate = useRef(false);
  const searchParams = useSearchParams();

  const load = useCallback(async (query: string) => {
    const res = await fetch(`/api/cvs${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    const json = await res.json();
    setItems(json.items);
  }, []);

  useEffect(() => { load(""); }, [load]);

  // ?new=1 dari Nav → langsung bikin CV baru sekali saja
  useEffect(() => {
    if (searchParams.get("new") === "1" && !autosCreate.current) {
      autosCreate.current = true;
      (async () => {
        const res = await fetch("/api/cvs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "CV Baru" }),
        });
        if (res.ok) {
          const { item } = await res.json();
          window.location.href = `/dashboard/cv/${item.id}`;
        } else {
          toast("Gagal bikin CV baru", "err");
        }
      })();
    }
  }, [searchParams, toast]);

  // debounce pencarian
  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q, load]);

  async function togglePublish(item: Item) {
    setBusy(true);
    const next = item.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/cvs/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      toast(next === "published" ? "CV dipublikasikan" : "CV dijadikan draft");
      load(q);
    } else toast("Gagal mengubah status", "err");
  }

  async function doDelete() {
    if (!delTarget) return;
    const res = await fetch(`/api/cvs/${delTarget.id}`, { method: "DELETE" });
    setDelTarget(null);
    if (res.ok) { toast("CV dihapus"); load(q); }
    else toast("Gagal menghapus", "err");
  }

  return (
    <div className="fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-dim">Kelola semua CV kamu di sini.</p>
        </div>
        <input
          className="input max-w-xs"
          placeholder="Cari judul CV…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* state: loading / kosong / list */}
      {items === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-4xl">📄</p>
          <p className="mt-3 font-bold">{q ? `Tidak ada CV cocok "${q}"` : "Belum ada CV"}</p>
          <p className="mt-1 text-sm text-dim">Klik tombol "+ CV Baru" di kanan atas buat mulai.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-snug">{item.title}</h3>
                <span className={item.status === "published" ? "chip" : "chip chip-dim"}>
                  {item.status === "published" ? "🟢 publik" : "🖊 draft"}
                </span>
              </div>
              <p className="mt-1 text-sm text-dim">
                {item.data?.personal?.full_name || "—"} · diubah {formatTanggal(item.updated_at)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/dashboard/cv/${item.id}`} className="btn btn-accent text-xs">✏️ Edit</Link>
                {item.status === "published" && (
                  <Link href={`/cv/${item.slug}`} className="btn btn-ghost text-xs" target="_blank">👁 Lihat</Link>
                )}
                <button className="btn btn-ghost text-xs" disabled={busy} onClick={() => togglePublish(item)}>
                  {item.status === "published" ? "→ Draft" : "→ Publik"}
                </button>
                <button className="btn btn-danger text-xs" onClick={() => setDelTarget(item)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Hapus CV?">
        <p className="text-sm text-dim">
          CV <b>{delTarget?.title}</b> akan dihapus permanen.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setDelTarget(null)}>Batal</button>
          <button className="btn btn-accent" style={{ background: "var(--danger)", color: "#fff" }} onClick={doDelete}>
            Ya, Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
