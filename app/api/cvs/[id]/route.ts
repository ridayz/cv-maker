// API detail CV: GET / PUT / DELETE
import { NextRequest, NextResponse } from "next/server";
import { getCv, updateCv, deleteCv } from "@/lib/db";
import type { CVData } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const cv = getCv(id);
  if (!cv) return NextResponse.json({ error: "CV tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ item: cv });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  const patch: Partial<{ title: string; data: CVData; status: string; body: string }> = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.status === "string" && ["draft", "published"].includes(body.status)) patch.status = body.status;
  if (typeof body.body === "string") patch.body = body.body;
  if (body.data && typeof body.data === "object") patch.data = body.data as CVData;
  const cv = updateCv(id, patch);
  if (!cv) return NextResponse.json({ error: "CV tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ item: cv });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteCv(id);
  if (!ok) return NextResponse.json({ error: "CV tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
