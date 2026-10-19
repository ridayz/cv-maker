// Provider toast global + hook useToast — feedback tiap aksi
"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; msg: string; kind: "ok" | "err" };
const ToastCtx = createContext<(msg: string, kind?: "ok" | "err") => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((msg: string, kind: "ok" | "err" = "ok") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* tumpukan toast di kanan-bawah */}
      <div className="no-print fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-anim card flex items-center gap-2 px-4 py-2.5 text-sm shadow-xl"
            style={{ borderColor: t.kind === "ok" ? "var(--accent)" : "var(--danger)" }}
          >
            <span>{t.kind === "ok" ? "✅" : "⚠️"}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
