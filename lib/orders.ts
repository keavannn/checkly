import { useSyncExternalStore } from "react";
import { type Lang } from "./i18n";
import { type DemoConfig, readConfig, guestFullName } from "./config";
import { restaurationSections, boissonSections, produitSections } from "./menu";

export type OrderStatus = "nouveau" | "en_preparation" | "en_route" | "livre";
export type OrderKind = "cuisine" | "reception" | "sejour";
export type OrderItem = { nom: string; emoji: string; qty: number; prix: number };
export type Order = { id: number; chambre: number; client: string; articles: OrderItem[]; total: number; heure: string; statut: OrderStatus; timestamp: number; kind: OrderKind; paid?: boolean; deliveredAt?: number };

export const statutInfo: Record<OrderStatus, { label: string; bg: string; border: string; dot: string }> = {
  nouveau: { label: "Nouvelle commande", bg: "#FFEBEE", border: "#E57373", dot: "#E53935" },
  en_preparation: { label: "En préparation", bg: "#FFF3E0", border: "#FFB74D", dot: "#FB8C00" },
  en_route: { label: "En livraison", bg: "#EFEAE0", border: "#D8CFBF", dot: "#8b7355" },
  livre: { label: "Livré ✓", bg: "#E8F5E9", border: "#81C784", dot: "#388E3C" },
};

const statutLabelEn: Record<OrderStatus, string> = {
  nouveau: "New order",
  en_preparation: "Being prepared",
  en_route: "Out for delivery",
  livre: "Delivered ✓",
};

export function orderStatusLabel(status: OrderStatus, lang: Lang = "fr"): string {
  return lang === "en" ? statutLabelEn[status] : statutInfo[status].label;
}

const ORDERS_KEY = "checkly_commandes";
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  notify();
}

export function addOrder(articles: OrderItem[], total: number, kind: OrderKind = "cuisine", statut: OrderStatus = "nouveau", paid = false): Order {
  const config = readConfig();
  const order: Order = {
    id: Date.now(),
    chambre: config.room,
    client: guestFullName(config),
    articles,
    total,
    heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    statut,
    timestamp: Date.now(),
    kind,
    paid,
    deliveredAt: statut === "livre" ? Date.now() : undefined,
  };
  writeOrders([...readOrders(), order]);
  return order;
}

export function updateOrderStatus(id: number, statut: OrderStatus) {
  const orders = readOrders().map((o) => (o.id === id ? { ...o, statut, deliveredAt: statut === "livre" ? (o.deliveredAt ?? Date.now()) : o.deliveredAt } : o));
  writeOrders(orders);
  return orders;
}

export function clearOrders() {
  writeOrders([]);
}

export function clearRoomOrders(room: number) {
  writeOrders(readOrders().filter((o) => o.chambre !== room));
}

export function deleteOrder(id: number) {
  writeOrders(readOrders().filter((o) => o.id !== id));
}

/** Timestamp dans les ~20 dernières heures, mais à une heure plausible pour ce type de demande (garanti dans la fenêtre "aujourd'hui" des stats). */
function recentTimestamp(hourMin: number, hourMax: number): number {
  const now = Date.now();
  const windowMs = 20 * 60 * 60 * 1000;
  for (let attempt = 0; attempt < 8; attempt++) {
    const t = now - Math.random() * windowMs;
    const h = new Date(t).getHours();
    if (h >= hourMin && h < hourMax) return t;
  }
  return now - Math.random() * windowMs;
}

/** Timestamp réparti sur les jours précédents (1 à daysMax jours), à une heure plausible pour ce type de demande. */
function spreadTimestamp(daysMax: number, hourMin: number, hourMax: number): number {
  const daysAgo = 1 + Math.floor(Math.random() * daysMax);
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  d.setHours(hourMin + Math.floor(Math.random() * (hourMax - hourMin)), Math.floor(Math.random() * 60), 0, 0);
  return d.getTime();
}

/** Génère de fausses commandes passées (réparties sur 30 jours, plusieurs chambres) pour que les statistiques aient de la matière en démo. */
export function seedDemoActivity(config: DemoConfig) {
  const allItems = [...restaurationSections, ...boissonSections, ...produitSections].flatMap((s) => s.items).filter((i) => i.prix > 0);
  if (allItems.length === 0) return;
  const rooms = [config.room, config.room + 2, config.room + 5, config.room - 3, config.room + 8];
  const guests = [guestFullName(config), "Sophie Martin", "James Cooper", "Elena Rossi", "Marco Keller"];
  const count = 30;
  const newOrders: Order[] = Array.from({ length: count }).map((_, i) => {
    const timestamp = i < 8 ? recentTimestamp(7, 23) : spreadTimestamp(30, 7, 23);
    const roomIdx = Math.floor(Math.random() * rooms.length);
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const picked = new Map<string, OrderItem>();
    for (let n = 0; n < itemCount; n++) {
      const item = allItems[Math.floor(Math.random() * allItems.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      const existing = picked.get(item.nom);
      if (existing) existing.qty += qty;
      else picked.set(item.nom, { nom: item.nom, emoji: item.emoji, qty, prix: item.prix });
    }
    const articles: OrderItem[] = [...picked.values()];
    const total = articles.reduce((s, a) => s + a.qty * a.prix, 0);
    return {
      id: Math.round(timestamp) * 1000 + i,
      chambre: rooms[roomIdx],
      client: guests[roomIdx],
      articles,
      total,
      heure: new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      statut: "livre" as OrderStatus,
      timestamp,
      kind: "cuisine" as OrderKind,
      paid: true,
      deliveredAt: timestamp + (20 + Math.random() * 20) * 60 * 1000,
    };
  });

  const receptionSamples: { nom: string; emoji: string; prix: number }[] = [
    { nom: "Ménage immédiat", emoji: "🧹", prix: 0 },
    { nom: "Changer les draps", emoji: "🛏️", prix: 0 },
    { nom: "Serviette de bain", emoji: "🏖️", prix: 0 },
    { nom: "Oreiller moelleux", emoji: "🛏️", prix: 0 },
    { nom: "Savon", emoji: "🧼", prix: 0 },
    { nom: "Kit dentaire", emoji: "🪥", prix: 0 },
    { nom: "Chargeur universel", emoji: "🔌", prix: 0 },
    { nom: "Peignoir", emoji: "🥋", prix: 0 },
    { nom: "Late check-out 14h00", emoji: "🧳", prix: 40 },
  ];
  const receptionCount = 20;
  const receptionOrders: Order[] = Array.from({ length: receptionCount }).map((_, i) => {
    const roomIdx = Math.floor(Math.random() * rooms.length);
    let nom: string, emoji: string, prix: number, hourMin: number, hourMax: number;
    if (Math.random() < 0.35) {
      const m = ["00", "15", "30", "45"][Math.floor(Math.random() * 4)];
      if (Math.random() < 0.5) {
        // Ménage programmé : uniquement en heures de service (9h-18h), demande passée dans la journée.
        const h = String(9 + Math.floor(Math.random() * 9)).padStart(2, "0");
        nom = `Ménage à ${h}:${m}`; emoji = "◷"; prix = 0;
        hourMin = 8; hourMax = 20;
      } else {
        // Réveil : heure demandée tôt le matin (5h-10h), mais la demande elle-même peut être passée à toute heure raisonnable.
        const h = String(5 + Math.floor(Math.random() * 5)).padStart(2, "0");
        nom = `Réveil à ${h}:${m}`; emoji = "⏰"; prix = 0;
        hourMin = 7; hourMax = 23;
      }
    } else {
      const sample = receptionSamples[Math.floor(Math.random() * receptionSamples.length)];
      nom = sample.nom; emoji = sample.emoji; prix = sample.prix;
      hourMin = 8; hourMax = 22;
    }
    const timestamp = i < 6 ? recentTimestamp(hourMin, hourMax) : spreadTimestamp(30, hourMin, hourMax);
    return {
      id: Math.round(timestamp) * 1000 + 500000 + i,
      chambre: rooms[roomIdx],
      client: guests[roomIdx],
      articles: [{ nom, emoji, qty: 1, prix }],
      total: prix,
      heure: new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      statut: "livre" as OrderStatus,
      timestamp,
      kind: "reception" as OrderKind,
      paid: true,
      deliveredAt: timestamp + (10 + Math.random() * 30) * 60 * 1000,
    };
  });

  writeOrders([...readOrders(), ...newOrders, ...receptionOrders]);
}

let cachedRaw: string | null = null;
let cachedSnapshot: Order[] = [];
function getSnapshot(): Order[] {
  const raw = localStorage.getItem(ORDERS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSnapshot = raw ? JSON.parse(raw) : [];
    } catch {
      cachedSnapshot = [];
    }
  }
  return cachedSnapshot;
}
const emptyOrders: Order[] = [];
function getServerSnapshot(): Order[] {
  return emptyOrders;
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => { if (e.key === ORDERS_KEY) callback(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(callback); window.removeEventListener("storage", onStorage); };
}

export function useOrders() {
  const orders = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { orders };
}

export type StayBillLine = { id: number; label: string; total: number; statut: OrderStatus };

const nonBillableLabels = new Set(["Ne pas déranger", "Fin du mode Ne pas déranger"]);

function computeBill(orders: Order[], room: number, unpaidOnly: boolean): { lines: StayBillLine[]; total: number } {
  const lines = orders
    .filter((o) => o.chambre === room && (!unpaidOnly || !o.paid) && !(o.articles.length === 1 && nonBillableLabels.has(o.articles[0].nom)))
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((o) => ({
      id: o.id,
      label: o.articles.map((a) => (a.qty > 1 ? `${a.nom} ×${a.qty}` : a.nom)).join(", "),
      total: o.total,
      statut: o.statut,
    }));
  const total = lines.reduce((sum, l) => sum + l.total, 0);
  return { lines, total };
}

/** Toutes les prestations du séjour (payées ou non) — pour "Ma note de séjour" côté client. */
export function getStayBill(orders: Order[], room: number): { lines: StayBillLine[]; total: number } {
  return computeBill(orders, room, false);
}

/** Uniquement les prestations pas encore réglées — pour le paiement du check-out (les extras déjà payés au check-in ne sont pas re-facturés). */
export function getUnpaidBill(orders: Order[], room: number): { lines: StayBillLine[]; total: number } {
  return computeBill(orders, room, true);
}
