// API list & create CV
import { NextRequest, NextResponse } from "next/server";
import { listCvs, createCv } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json({ items: listCvs(q) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const cv = createCv({ title: typeof body.title === "string" ? body.title : "" });
  return NextResponse.json({ item: cv }, { status: 201 });
}
