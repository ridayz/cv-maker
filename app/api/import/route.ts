// API import: POST teks mentah → CVData hasil heuristik
import { NextRequest, NextResponse } from "next/server";
import { importCvFromText } from "@/lib/import-parse";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) return NextResponse.json({ error: "Teks kosong" }, { status: 400 });
  if (text.length > 200_000) return NextResponse.json({ error: "Teks kebesaran (maks 200k karakter)" }, { status: 400 });
  return NextResponse.json({ data: importCvFromText(text) });
}
