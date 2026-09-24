import { useSyncExternalStore } from "react";

export type HotelInfoItem = { id: string; title: string; hours: string; enabled: boolean; image?: string };

export type DemoConfig = {
  hotelName: string;
  city: string;
  country: string;
  guestFirst: string;
  guestLast: string;
  room: number;
  floor: number;
  guests: number;
  hotelInfo: HotelInfoItem[];
};

export const defaultHotelInfo: HotelInfoItem[] = [
  { id: "piscine", title: "Piscine", hours: "7h-21h · Niveau 2", enabled: true },
  { id: "spa", title: "Spa", hours: "9h-20h · Sur réservation", enabled: true },
  { id: "restaurant", title: "Restaurant", hours: "7h-10h30 / 19h-22h", enabled: true },
  { id: "sport", title: "Salle de sport", hours: "6h-22h · Accès libre", enabled: true },
  { id: "voiturier", title: "Voiturier", hours: "24h/24 · Hall principal", enabled: true },
  { id: "reception", title: "Réception", hours: "24h/24 · Poste 0 · +33 4 67 12 34 56", enabled: true },
];

export const defaultConfig: DemoConfig = {
  hotelName: "Hôtel Prestige",
  city: "Montpellier",
  country: "France",
  guestFirst: "Keavan",
  guestLast: "Dubois",
  room: 412,
  floor: 4,
  guests: 2,
  hotelInfo: defaultHotelInfo,
};

const CONFIG_KEY = "checkly_config";
const configListeners = new Set<() => void>();
function notifyConfig() { configListeners.forEach((l) => l()); }

export function readConfig(): DemoConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    return { ...defaultConfig, ...JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") };
  } catch {
    return defaultConfig;
  }
}

export function setConfig(partial: Partial<DemoConfig>) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...readConfig(), ...partial }));
  notifyConfig();
}

export function resetConfig() {
  localStorage.removeItem(CONFIG_KEY);
  notifyConfig();
}

let cachedConfigRaw: string | null = null;
let cachedConfig: DemoConfig = defaultConfig;
function getConfigSnapshot(): DemoConfig {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (raw !== cachedConfigRaw) {
    cachedConfigRaw = raw;
    cachedConfig = { ...defaultConfig, ...(raw ? JSON.parse(raw) : {}) };
  }
  return cachedConfig;
}
function getConfigServerSnapshot(): DemoConfig {
  return defaultConfig;
}
function subscribeConfig(callback: () => void) {
  configListeners.add(callback);
  const onStorage = (e: StorageEvent) => { if (e.key === CONFIG_KEY) callback(); };
  window.addEventListener("storage", onStorage);
  return () => { configListeners.delete(callback); window.removeEventListener("storage", onStorage); };
}

export function useConfig() {
  return useSyncExternalStore(subscribeConfig, getConfigSnapshot, getConfigServerSnapshot);
}

export function guestFullName(config: DemoConfig) {
  return `${config.guestFirst} ${config.guestLast}`;
}

export function wifiName(config: DemoConfig) {
  return `${config.hotelName.replace(/\s+/g, "")}-Guest`;
}

const countryCurrencies: Record<string, string> = {
  switzerland: "CHF", suisse: "CHF",
  france: "€", germany: "€", allemagne: "€", italy: "€", italie: "€", spain: "€", espagne: "€",
  portugal: "€", belgium: "€", belgique: "€", netherlands: "€", "pays-bas": "€", austria: "€", autriche: "€",
  luxembourg: "€", ireland: "€", irlande: "€", greece: "€", grece: "€", finland: "€", finlande: "€",
  "united kingdom": "£", "royaume-uni": "£", uk: "£", england: "£", angleterre: "£",
  "united states": "$", "états-unis": "$", usa: "$", "etats-unis": "$",
  canada: "CAD $",
};

export function getCurrency(country: string): string {
  return countryCurrencies[country.trim().toLowerCase()] ?? "CHF";
}
