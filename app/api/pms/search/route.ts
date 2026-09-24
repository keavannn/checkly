import { NextRequest, NextResponse } from "next/server";
import { findReservationByLastName } from "@/lib/apaleo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ found: false, error: "Requête invalide" }, { status: 400 });
  }
  const lastName = (body as { lastName?: unknown } | null)?.lastName;
  if (!lastName || typeof lastName !== "string") {
    return NextResponse.json({ found: false, error: "Nom manquant" }, { status: 400 });
  }
  try {
    const reservation = await findReservationByLastName(lastName);
    if (!reservation) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, reservation });
  } catch {
    return NextResponse.json({ found: false, error: "Connexion au système hôtelier impossible" }, { status: 502 });
  }
}
