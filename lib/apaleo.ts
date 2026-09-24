const TOKEN_URL = "https://identity.apaleo.com/connect/token";
const API_BASE = "https://api.apaleo.com";
const apaleoDate = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");

type ApaleoReservationRaw = {
  id: string;
  status: string;
  primaryGuest: { firstName: string; lastName: string; email?: string };
  unitGroup?: { name?: string };
  unit?: { name?: string };
  property?: { name?: string };
  ratePlan?: { id: string };
  comment?: string;
  arrival: string;
  departure: string;
  adults: number;
  totalGrossAmount?: { amount: number; currency: string };
};

export type ApaleoReservation = {
  id: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  roomName: string;
  propertyName: string;
  arrival: string;
  departure: string;
  adults: number;
  totalAmount: number;
  currency: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) return cachedToken.value;
  const clientId = process.env.APALEO_CLIENT_ID;
  const clientSecret = process.env.APALEO_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Identifiants Apaleo manquants");
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Connexion à Apaleo refusée");
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

export type ArrivalStatus = "attendu" | "arrive" | "parti";

export type ApaleoArrival = {
  id: string;
  room: string;
  guestName: string;
  arrival: string;
  departure: string;
  nights: number;
  status: ArrivalStatus;
  propertyName: string;
};

const arrivalStatusByRaw: Record<string, ArrivalStatus> = {
  Confirmed: "attendu",
  InHouse: "arrive",
  CheckedOut: "parti",
};

export async function getUpcomingArrivals(): Promise<ApaleoArrival[]> {
  const token = await getAccessToken();
  const from = new Date();
  from.setDate(from.getDate() - 1);
  const to = new Date();
  to.setDate(to.getDate() + 3);
  const params = new URLSearchParams({
    dateFilter: "Stay",
    from: apaleoDate(from.getTime()),
    to: apaleoDate(to.getTime()),
    pageSize: "20",
    sort: "arrival:asc",
    status: "Confirmed,InHouse,CheckedOut",
  });
  const url = `${API_BASE}/booking/v1/reservations?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (res.status === 204) return [];
  if (!res.ok) throw new Error("Récupération des arrivées Apaleo impossible");
  const data = (await res.json()) as { reservations?: ApaleoReservationRaw[] };
  return (data.reservations ?? []).map((r) => ({
    id: r.id,
    room: r.unit?.name || r.unitGroup?.name || "-",
    guestName: `${r.primaryGuest.firstName} ${r.primaryGuest.lastName}`,
    arrival: r.arrival,
    departure: r.departure,
    nights: Math.max(1, Math.round((new Date(r.departure).getTime() - new Date(r.arrival).getTime()) / 86400000)),
    status: arrivalStatusByRaw[r.status] ?? "attendu",
    propertyName: r.property?.name || "",
  }));
}

export async function findReservationByLastName(lastName: string): Promise<ApaleoReservation | null> {
  const trimmed = lastName.trim();
  if (!trimmed) return null;
  const token = await getAccessToken();
  const url = `${API_BASE}/booking/v1/reservations?textSearch=${encodeURIComponent(trimmed)}&pageSize=1`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Recherche Apaleo impossible");
  const data = (await res.json()) as { reservations?: ApaleoReservationRaw[] };
  const r = data.reservations?.[0];
  if (!r) return null;
  return {
    id: r.id,
    guestFirstName: r.primaryGuest.firstName,
    guestLastName: r.primaryGuest.lastName,
    guestEmail: r.primaryGuest.email || "",
    roomName: r.unitGroup?.name || r.unit?.name || "",
    propertyName: r.property?.name || "",
    arrival: r.arrival,
    departure: r.departure,
    adults: r.adults,
    totalAmount: r.totalGrossAmount?.amount ?? 0,
    currency: r.totalGrossAmount?.currency ?? "EUR",
  };
}

export type CheckInResult = { ok: boolean; noted?: boolean; message?: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Ajoute une ligne au commentaire interne de la réservation (visible par la réception dans Apaleo). Ne bloque jamais le check-in. */
async function addReservationNote(id: string, existing: string | undefined, note: string, headers: { Authorization: string }): Promise<boolean> {
  if (existing?.includes(note)) return true;
  try {
    const res = await fetch(`${API_BASE}/booking/v1/reservations/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify([{ op: "add", path: "/comment", value: existing ? `${existing}\n${note}` : note }]),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Check-in réel d'une réservation. Si l'arrivée prévue est dans le futur, on avance l'arrivée à maintenant (arrivée anticipée), comme le ferait un réceptionniste. */
export async function checkInReservation(id: string, note?: string): Promise<CheckInResult> {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  const getRes = await fetch(`${API_BASE}/booking/v1/reservations/${id}`, { headers, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!getRes.ok) return { ok: false, message: "Réservation introuvable" };
  const r = (await getRes.json()) as ApaleoReservationRaw;
  const noted = note ? await addReservationNote(id, r.comment, note, headers) : false;
  if (r.status === "InHouse" || r.status === "CheckedOut") return { ok: true, noted };
  if (r.status !== "Confirmed") return { ok: false, noted, message: `Statut ${r.status} : check-in impossible` };

  if (Date.parse(r.arrival) > Date.now()) {
    const newArrivalMs = Date.now() + 4000;
    const offsetMatch = r.departure.match(/([+-])(\d{2}):(\d{2})$/);
    const offsetMin = offsetMatch ? (offsetMatch[1] === "-" ? -1 : 1) * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3])) : 0;
    const arrivalDay = new Date(newArrivalMs + offsetMin * 60000).toISOString().slice(0, 10);
    const nights = Math.round((Date.parse(r.departure.slice(0, 10)) - Date.parse(arrivalDay)) / 86400000);
    if (nights < 1 || !r.ratePlan) return { ok: false, noted, message: "Arrivée anticipée impossible" };
    const ratePlanId = r.ratePlan.id;
    const amend = (sliceCount: number) => fetch(`${API_BASE}/booking/v1/reservation-actions/${id}/amend`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        arrival: apaleoDate(newArrivalMs),
        departure: r.departure,
        adults: r.adults,
        requote: true,
        timeSlices: Array.from({ length: sliceCount }, () => ({ ratePlanId })),
      }),
      signal: AbortSignal.timeout(8000),
    });
    let amendRes = await amend(nights);
    if (!amendRes.ok) {
      const detail = (await amendRes.json().catch(() => null)) as { messages?: string[] } | null;
      // Avant le changement de jour hôtelier (ex. 3h du matin), Apaleo compte la nuit précédente : il indique le bon nombre de nuits.
      const expected = Number(detail?.messages?.[0]?.match(/(\d+) time slices must be specified/)?.[1]);
      if (expected > 0) amendRes = await amend(expected);
      if (!amendRes.ok) return { ok: false, noted, message: "Arrivée anticipée refusée" };
    }
    await wait(4500);
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(`${API_BASE}/booking/v1/reservation-actions/${id}/checkin`, { method: "PUT", headers, signal: AbortSignal.timeout(8000) });
    if (res.ok) return { ok: true, noted };
    await wait(2000);
  }
  return { ok: false, noted, message: "Check-in refusé par le système hôtelier" };
}
