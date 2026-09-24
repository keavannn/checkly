import { NextRequest, NextResponse } from "next/server";
import { checkInReservation } from "@/lib/apaleo";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide" }, { status: 400 });
  }
  const id = (body as { id?: unknown } | null)?.id;
  if (typeof id !== "string" || !/^[A-Z0-9]+-\d+$/.test(id)) {
    return NextResponse.json({ ok: false, message: "Identifiant de réservation invalide" }, { status: 400 });
  }
  try {
    const rawNote = (body as { note?: unknown }).note;
    const note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim().slice(0, 500) : undefined;
    const result = await checkInReservation(id, note);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch {
    return NextResponse.json({ ok: false, message: "Connexion au système hôtelier impossible" }, { status: 502 });
  }
}
