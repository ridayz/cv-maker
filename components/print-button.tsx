// Tombol print (PDF) — harus client karena panggil window.print()
"use client";

export function PrintButton() {
  return (
    <button className="btn btn-accent text-sm" onClick={() => window.print()}>
      🖨 Print / PDF
    </button>
  );
}
