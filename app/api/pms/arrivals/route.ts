import { NextResponse } from "next/server";
import { getUpcomingArrivals } from "@/lib/apaleo";

export const runtime = "nodejs";

export async function GET() {
  try {
    const arrivals = await getUpcomingArrivals();
    return NextResponse.json({ arrivals });
  } catch {
    return NextResponse.json({ arrivals: [], error: "Connexion au système hôtelier impossible" }, { status: 502 });
  }
}
