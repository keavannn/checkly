const TOKEN_URL = "https://identity.apaleo.com/connect/token";
const API_BASE = "https://api.apaleo.com";

type ApaleoReservationRaw = {
  id: string;
  status: string;
  primaryGuest: { firstName: string; lastName: string; email?: string };
  unitGroup?: { name?: string };
  unit?: { name?: string };
  property?: { name?: string };
  arrival: string;
  departure: string;
  adults: number;
  totalGrossAmount?: { amount: number; currency: string };
};

export type ApaleoReservation = {
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
  const toApaleoDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    dateFilter: "Stay",
    from: toApaleoDate(from),
    to: toApaleoDate(to),
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
