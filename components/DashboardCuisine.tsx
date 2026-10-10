"use client";

import "../app/dashboard.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig, getCurrency } from "@/lib/config";
import {
  updateOrderStatus, useOrders, seedDemoActivity,
  type Order, type OrderStatus, type OrderItem,
} from "@/lib/orders";
import { useChatMessages, sendChatMessage, getRoomConversations, seedDemoChats } from "@/lib/chat";
import type { ApaleoArrival } from "@/lib/apaleo";
import { languageOptions, type Lang } from "@/lib/i18n";
import { dashboardCopy, translateOrderName, type DashCopy } from "@/lib/i18n/dashboard";

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* audio not available */ }
}

function minutesAgo(timestamp: number, now: number) {
  return Math.max(0, Math.round((now - timestamp) / 60000));
}

function clockTime(date: Date | number, locale: string) {
  return new Date(date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function relativeDayLabel(iso: string, t: DashCopy): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  return t.relDay(diffDays, clockTime(d, t.locale));
}

const LANG_KEY = "checkly_dashboard_lang";
function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && languageOptions.some((o) => o.code === stored)) return stored as Lang;
  } catch { /* storage unavailable */ }
  return "fr";
}

const PERIOD_MS: Record<"jour" | "semaine" | "mois", number> = { jour: 24 * 60 * 60 * 1000, semaine: 7 * 24 * 60 * 60 * 1000, mois: 30 * 24 * 60 * 60 * 1000 };
const RECENT_DONE_LIMIT = 4;
const NOTICE_LABELS = new Set(["Ne pas déranger", "Fin du mode Ne pas déranger"]);

function mergeArticles(articles: OrderItem[]): OrderItem[] {
  const map = new Map<string, OrderItem>();
  articles.forEach((a) => {
    const existing = map.get(a.nom);
    if (existing) existing.qty += a.qty;
    else map.set(a.nom, { ...a });
  });
  return [...map.values()];
}

type Tr = { t: DashCopy; lang: Lang };

function RoomCard({ room, currency, t, lang }: { room: { chambre: number; client: string; orders: Order[] }; currency: string } & Tr) {
  const [expanded, setExpanded] = useState(false);
  const active = room.orders.filter((o) => o.statut !== "livre").length;
  const lateCheckout = room.orders.some((o) => o.articles.some((a) => a.nom.startsWith("Late check-out")));
  const total = room.orders.reduce((s, o) => s + o.total, 0);
  const itemCount = room.orders.reduce((s, o) => s + o.articles.reduce((s2, a) => s2 + a.qty, 0), 0);
  const sortedOrders = [...room.orders].sort((a, b) => b.timestamp - a.timestamp);
  return <div className="dash-card">
    <div className="dash-card-top"><strong>{t.room(room.chambre)}</strong><span>{t.activeCount(active)}</span></div>
    <div className="dash-room">{room.client}{lateCheckout && ` · ◷ ${t.lateCheckoutTag}`}</div>
    <div className="dash-room-summary">{t.ordersItems(room.orders.length, itemCount)}</div>
    {expanded && <div className="dash-room-orders">
      {sortedOrders.map((o) => <div className="dash-room-order" key={o.id}>
        <div className="dash-room-order-head"><span>{o.heure}</span><b>{o.total > 0 ? `${o.total} ${currency}` : t.free}</b></div>
        <ul className="dash-items">{mergeArticles(o.articles).map((a) => <li key={a.nom}>{a.emoji} {translateOrderName(a.nom, lang)} × {a.qty}</li>)}</ul>
      </div>)}
    </div>}
    <button className="dash-room-toggle" onClick={() => setExpanded((v) => !v)}>{expanded ? t.collapse : t.seeDetail}</button>
    <div className="dash-total"><span>{t.stayTotal}</span><b>{total} {currency}</b></div>
  </div>;
}

function OrderCard({ order, now, newFlag, onAction, currency, t, lang }: { order: Order; now: number; newFlag: boolean; onAction: (id: number, next: OrderStatus) => void; currency: string } & Tr) {
  const mins = minutesAgo(order.timestamp, now);
  return <div className={`dash-card${newFlag ? " dash-new" : ""}${order.statut === "en_route" ? " dash-pending-client" : ""}${order.statut === "livre" ? " dash-delivered" : ""}`}>
    <div className="dash-card-top"><strong>#{String(order.id).slice(-4)}</strong><span>{order.heure}</span></div>
    <div className="dash-room">{t.room(order.chambre)} · {order.client}</div>
    <ul className="dash-items">{order.articles.map((a, i) => <li key={i}>{a.emoji} {translateOrderName(a.nom, lang)} × {a.qty}</li>)}</ul>
    <div className="dash-total"><span>{t.total}</span><b>{order.total} {currency}</b></div>
    {order.statut === "nouveau" && <button className="dash-btn-accept" onClick={() => onAction(order.id, "en_preparation")}>{t.acceptPrepare}</button>}
    {order.statut === "en_preparation" && <button className="dash-btn-ready" onClick={() => onAction(order.id, "en_route")}>{t.readyToDeliver}</button>}
    {order.statut === "en_route" && <span className="dash-badge-pending">{t.inDeliveryWaiting}</span>}
    {order.statut === "livre" && <span className="dash-badge-done">{t.deliveredBadge}</span>}
    <div className="dash-time">{t.timeAgo(order.heure, mins)}</div>
  </div>;
}

function ReservationRow({ r, t }: { r: ApaleoArrival; t: DashCopy }) {
  return <div className={`dash-resa-row dash-resa-${r.status}`}>
    <span className="dash-resa-room">{t.roomAbbr} {r.room}</span>
    <span className="dash-resa-guest">{r.guestName}</span>
    <span className="dash-resa-dates">{relativeDayLabel(r.arrival, t)} <span className="dash-arrow">→</span> {relativeDayLabel(r.departure, t)}</span>
    <span className="dash-resa-status">{t.resaStatus[r.status]}</span>
  </div>;
}

function ReceptionCard({ order, now, newFlag, onAction, t, lang }: { order: Order; now: number; newFlag: boolean; onAction: (id: number, next: OrderStatus) => void } & Tr) {
  const mins = minutesAgo(order.timestamp, now);
  const done = order.statut === "livre";
  return <div className={`dash-card${newFlag ? " dash-new" : ""}${done ? " dash-delivered" : ""}`}>
    <div className="dash-card-top"><strong>{t.room(order.chambre)}</strong><span>{order.heure}</span></div>
    <div className="dash-room">{order.client}</div>
    <ul className="dash-items">{order.articles.map((a, i) => <li key={i}>{a.emoji} {translateOrderName(a.nom, lang)} × {a.qty}</li>)}</ul>
    {done ? <span className="dash-badge-done">{t.handledBadge}</span> : <button className="dash-btn-accept" onClick={() => onAction(order.id, "livre")}>{t.markHandled}</button>}
    <div className="dash-time">{t.timeAgo(order.heure, mins)}</div>
  </div>;
}

function niceMaxOf(raw: number): number {
  if (raw <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const residual = raw / magnitude;
  const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  return niceResidual * magnitude;
}

function RevenueTrend({ data, currency }: { data: { label: string; value: number }[]; currency: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const height = 220;
  const padL = 46;
  const padR = 12;
  const padT = 16;
  const padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const maxRaw = Math.max(0, ...data.map((d) => d.value));
  const niceMax = niceMaxOf(maxRaw);
  const yTicks = [0, niceMax * 0.5, niceMax];
  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
  const points = data.map((d, i) => ({ x: padL + i * xStep, y: padT + innerH - (d.value / niceMax) * innerH, ...d }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const areaPath = points.length ? `${linePath} L ${last.x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z` : "";
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));
  const hoveredPoint = hover != null ? points[hover] : null;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (width / rect.width);
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx - padL) / (xStep || 1))));
    setHover(idx);
  };

  if (points.length === 0) return null;

  return <div className="dash-trend-wrap">
    <svg viewBox={`0 0 ${width} ${height}`} className="dash-trend-svg" onMouseMove={handleMove} onMouseLeave={() => setHover(null)}>
      {yTicks.map((t) => {
        const y = padT + innerH - (t / niceMax) * innerH;
        return <g key={t}>
          <line x1={padL} y1={y} x2={width - padR} y2={y} className="dash-trend-grid" />
          <text x={padL - 8} y={y + 4} textAnchor="end" className="dash-trend-axis">{Math.round(t)}</text>
        </g>;
      })}
      <path d={areaPath} className="dash-trend-area" />
      <path d={linePath} className="dash-trend-line" />
      {points.map((p, i) => (i % labelEvery === 0 || i === points.length - 1) && <text key={`lbl-${i}`} x={p.x} y={height - 6} textAnchor="middle" className="dash-trend-axis">{p.label}</text>)}
      <circle cx={last.x} cy={last.y} r="4" className="dash-trend-enddot" />
      <text x={last.x} y={Math.max(12, last.y - 10)} textAnchor="middle" className="dash-trend-endlabel">{last.value} {currency}</text>
      {hoveredPoint && <>
        <line x1={hoveredPoint.x} y1={padT} x2={hoveredPoint.x} y2={padT + innerH} className="dash-trend-crosshair" />
        <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" className="dash-trend-hoverdot" />
      </>}
    </svg>
    {hoveredPoint && <div className="dash-trend-tooltip" style={{ left: `${(hoveredPoint.x / width) * 100}%` }}>
      <strong>{hoveredPoint.label}</strong><span>{hoveredPoint.value} {currency}</span>
    </div>}
  </div>;
}

function HistoriqueRoomCard({ room, currency, t, lang }: { room: { chambre: number; client: string; orders: Order[] }; currency: string } & Tr) {
  const [expanded, setExpanded] = useState(false);
  const total = room.orders.reduce((s, o) => s + o.total, 0);
  const itemCount = room.orders.reduce((s, o) => s + o.articles.reduce((s2, a) => s2 + a.qty, 0), 0);
  const sortedOrders = [...room.orders].sort((a, b) => b.timestamp - a.timestamp);
  return <div className="dash-card">
    <div className="dash-card-top"><strong>{t.room(room.chambre)}</strong></div>
    <div className="dash-room">{room.client}</div>
    <div className="dash-room-summary">{t.ordersItems(room.orders.length, itemCount)}</div>
    {expanded && <div className="dash-room-orders">
      {sortedOrders.map((o) => <div className="dash-room-order" key={o.id}>
        <div className="dash-room-order-head"><span>{o.heure}</span><b>{o.total > 0 ? `${o.total} ${currency}` : t.free}</b></div>
        <ul className="dash-items">{mergeArticles(o.articles).map((a) => <li key={a.nom}>{a.emoji} {translateOrderName(a.nom, lang)} × {a.qty}</li>)}</ul>
      </div>)}
    </div>}
    <button className="dash-room-toggle" onClick={() => setExpanded((v) => !v)}>{expanded ? t.collapse : t.seeDetail}</button>
    <div className="dash-total"><span>{t.dayTotal}</span><b>{total} {currency}</b></div>
  </div>;
}

export default function DashboardCuisine() {
  const { orders } = useOrders();
  const config = useConfig();
  const currency = getCurrency(config.country);
  const [lang, setLang] = useState<Lang>(readStoredLang);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const t = dashboardCopy[lang];
  const currentLang = languageOptions.find((o) => o.code === lang) ?? languageOptions[0];
  const rtl = Boolean(currentLang.rtl);
  const chooseLang = (code: Lang) => {
    setLang(code);
    setLangOpen(false);
    try { localStorage.setItem(LANG_KEY, code); } catch { /* storage unavailable */ }
  };
  useEffect(() => {
    if (!langOpen) return;
    const close = (e: MouseEvent) => { if (!langRef.current?.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [langOpen]);

  const [reservations, setReservations] = useState<ApaleoArrival[]>([]);
  const [reservationsError, setReservationsError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const fetchArrivals = () => {
      fetch("/api/pms/arrivals")
        .then((res) => res.json())
        .then((data) => { if (!cancelled) { setReservations(data.arrivals ?? []); setReservationsError(Boolean(data.error)); } })
        .catch(() => { if (!cancelled) setReservationsError(true); });
    };
    fetchArrivals();
    const interval = setInterval(fetchArrivals, 15000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);
  const [view, setView] = useState<"cuisine" | "reception" | "chambres" | "stats" | "chat" | "historique">("cuisine");
  const [now, setNow] = useState(() => Date.now());
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const knownIds = useRef<Set<number>>(new Set());
  const primed = useRef(false);
  const chatMessages = useChatMessages();
  const conversations = useMemo(() => getRoomConversations(chatMessages), [chatMessages]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [chatReply, setChatReply] = useState("");
  const knownChatIds = useRef<Set<number>>(new Set());
  const chatPrimed = useRef(false);
  const [newChatFlash, setNewChatFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (!primed.current) { knownIds.current = ids; primed.current = true; return; }
    const fresh = orders.filter((o) => !knownIds.current.has(o.id));
    if (fresh.length > 0) {
      playBeep();
      setNewIds((prev) => new Set([...prev, ...fresh.map((o) => o.id)]));
      setTimeout(() => setNewIds((prev) => { const next = new Set(prev); fresh.forEach((o) => next.delete(o.id)); return next; }), 3200);
    }
    knownIds.current = ids;
  }, [orders]);

  useEffect(() => {
    const ids = new Set(chatMessages.map((m) => m.id));
    if (!chatPrimed.current) { knownChatIds.current = ids; chatPrimed.current = true; return; }
    const freshFromClient = chatMessages.filter((m) => !knownChatIds.current.has(m.id) && m.from === "client");
    if (freshFromClient.length > 0) {
      playBeep();
      setNewChatFlash(true);
      setTimeout(() => setNewChatFlash(false), 3200);
    }
    knownChatIds.current = ids;
  }, [chatMessages]);

  const act = (id: number, next: OrderStatus) => updateOrderStatus(id, next);
  const sendReply = () => {
    if (!chatReply.trim() || selectedRoom == null) return;
    const conv = conversations.find((c) => c.room === selectedRoom);
    sendChatMessage(selectedRoom, conv?.guest ?? t.guestFallback, "reception", chatReply.trim());
    setChatReply("");
  };

  const nouvelles = orders.filter((o) => o.kind === "cuisine" && o.statut === "nouveau").sort((a, b) => a.timestamp - b.timestamp);
  const preparation = orders.filter((o) => o.kind === "cuisine" && o.statut === "en_preparation").sort((a, b) => a.timestamp - b.timestamp);
  const cuisineEnRoute = orders.filter((o) => o.kind === "cuisine" && o.statut === "en_route").sort((a, b) => b.timestamp - a.timestamp);
  const cuisineRecentDone = orders.filter((o) => o.kind === "cuisine" && o.statut === "livre").sort((a, b) => b.timestamp - a.timestamp).slice(0, RECENT_DONE_LIMIT);
  const pretesLivrees = [...cuisineEnRoute, ...cuisineRecentDone];
  const isReceptionNotice = (o: Order) => o.articles.length === 1 && (NOTICE_LABELS.has(o.articles[0].nom) || /^Réveil à \d{2}:\d{2}$/.test(o.articles[0].nom) || o.articles[0].nom.startsWith("Late check-out"));
  const receptionPending = orders.filter((o) => o.kind === "reception" && o.statut !== "livre").sort((a, b) => a.timestamp - b.timestamp);
  const receptionRecentDone = orders.filter((o) => o.kind === "reception" && o.statut === "livre").sort((a, b) => b.timestamp - a.timestamp).slice(0, RECENT_DONE_LIMIT);
  const receptionOrders = [...receptionPending, ...receptionRecentDone];
  const receptionTasks = receptionOrders.filter((o) => !isReceptionNotice(o));
  const receptionNotices = receptionOrders.filter((o) => isReceptionNotice(o));
  const receptionTasksPendingCount = receptionPending.filter((o) => !isReceptionNotice(o)).length;
  const historiqueJour = useMemo(() => orders
    .filter((o) => o.statut === "livre" && (o.kind === "cuisine" || o.kind === "reception") && now - o.timestamp <= PERIOD_MS.jour)
    .sort((a, b) => b.timestamp - a.timestamp), [orders, now]);
  const historiqueRooms = useMemo(() => {
    const map = new Map<number, { chambre: number; client: string; orders: Order[] }>();
    historiqueJour.forEach((o) => {
      if (!map.has(o.chambre)) map.set(o.chambre, { chambre: o.chambre, client: o.client, orders: [] });
      map.get(o.chambre)!.orders.push(o);
    });
    return [...map.values()].sort((a, b) => a.chambre - b.chambre);
  }, [historiqueJour]);

  const stats = useMemo(() => {
    const todaysOrders = orders.filter((o) => o.kind === "cuisine" && now - o.timestamp <= PERIOD_MS.jour);
    const total = todaysOrders.length;
    const ca = todaysOrders.reduce((s, o) => s + o.total, 0);
    const delivered = todaysOrders.filter((o) => o.statut === "livre" && o.deliveredAt != null);
    const tempsMoyen = delivered.length ? Math.round(delivered.reduce((s, o) => s + (o.deliveredAt! - o.timestamp) / 60000, 0) / delivered.length) : 0;
    const counts = new Map<string, number>();
    todaysOrders.forEach((o) => o.articles.forEach((a) => counts.set(a.nom, (counts.get(a.nom) || 0) + a.qty)));
    let plat = "—";
    let max = 0;
    counts.forEach((v, k) => { if (v > max) { max = v; plat = k; } });
    return { total, ca, tempsMoyen, plat };
  }, [orders, now]);

  const [statsPeriod, setStatsPeriod] = useState<"jour" | "semaine" | "mois">("jour");
  const [statsCategory, setStatsCategory] = useState<"cuisine" | "reception">("cuisine");
  const periodOrders = useMemo(() => orders.filter((o) => o.kind === statsCategory && now - o.timestamp <= PERIOD_MS[statsPeriod]), [orders, statsCategory, statsPeriod, now]);
  const periodTotal = useMemo(() => periodOrders.reduce((s, o) => s + o.total, 0), [periodOrders]);
  const trendData = useMemo(() => {
    if (statsPeriod === "jour") {
      const buckets = Array.from({ length: 24 }, () => 0);
      periodOrders.forEach((o) => { buckets[new Date(o.timestamp).getHours()] += o.total; });
      return buckets.map((value, i) => ({ label: `${i}h`, value }));
    }
    const days = statsPeriod === "semaine" ? 7 : 30;
    const dayMs = 24 * 60 * 60 * 1000;
    const buckets = Array.from({ length: days }, () => 0);
    periodOrders.forEach((o) => {
      const diff = Math.floor((now - o.timestamp) / dayMs);
      const idx = days - 1 - diff;
      if (idx >= 0 && idx < days) buckets[idx] += o.total;
    });
    return buckets.map((value, i) => {
      const d = new Date(now - (days - 1 - i) * dayMs);
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, value };
    });
  }, [periodOrders, statsPeriod, now]);
  const itemStats = useMemo(() => {
    const counts = new Map<string, { qty: number; revenue: number }>();
    periodOrders.forEach((o) => o.articles.forEach((a) => {
      const cur = counts.get(a.nom) || { qty: 0, revenue: 0 };
      cur.qty += a.qty;
      cur.revenue += a.qty * a.prix;
      counts.set(a.nom, cur);
    }));
    return [...counts.entries()].map(([nom, v]) => ({ nom, ...v })).sort((a, b) => b.qty - a.qty);
  }, [periodOrders]);
  const maxQty = itemStats[0]?.qty ?? 0;

  const historique = orders.filter((o) => o.kind === "cuisine" && o.statut === "livre").sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const rooms = useMemo(() => {
    const map = new Map<number, { chambre: number; client: string; orders: Order[] }>();
    orders.forEach((o) => {
      if (!map.has(o.chambre)) map.set(o.chambre, { chambre: o.chambre, client: o.client, orders: [] });
      map.get(o.chambre)!.orders.push(o);
    });
    return [...map.values()].sort((a, b) => a.chambre - b.chambre);
  }, [orders]);

  return <div className="dash-shell" dir={rtl ? "rtl" : "ltr"} lang={lang}>
    <header className="dash-header">
      <div><div className="dash-brand">{t.brand}</div><div className="dash-sub">{config.hotelName} {config.city}</div></div>
      <div className="dash-live"><b />{t.connected}</div>
      <div className="dash-toggle">
        <button className={view === "cuisine" ? "active" : ""} onClick={() => setView("cuisine")}>{t.tabKitchen}</button>
        <button className={view === "reception" ? "active" : ""} onClick={() => setView("reception")}>{t.tabReception}{receptionTasksPendingCount > 0 && <b className="dash-toggle-dot" />}</button>
        <button className={view === "chambres" ? "active" : ""} onClick={() => setView("chambres")}>{t.tabRooms}</button>
        <button className={`${view === "chat" ? "active" : ""}${newChatFlash ? " dash-flash" : ""}`} onClick={() => setView("chat")}>{t.tabChat}{conversations.some((c) => c.lastFrom === "client") && <b className="dash-toggle-dot" />}</button>
      </div>
      <div className="dash-counters">
        <div className="dash-counter"><strong>{nouvelles.length}</strong><span>{t.counterPending}</span></div>
        <div className="dash-counter"><strong>{preparation.length}</strong><span>{t.counterPreparing}</span></div>
        <div className="dash-counter"><strong>{orders.filter((o) => o.kind === "cuisine" && o.statut === "livre").length}</strong><span>{t.counterDelivered}</span></div>
      </div>
      <time className="dash-clock">{clockTime(now, t.locale)}</time>
      <div className="dash-lang" ref={langRef}>
        <button className="dash-lang-btn" onClick={() => setLangOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={langOpen} aria-label={t.languageLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" /></svg>
          <span>{currentLang.label}</span>
          <i aria-hidden="true">▾</i>
        </button>
        {langOpen && <ul className="dash-lang-menu" role="listbox" aria-label={t.languageLabel}>
          {languageOptions.map((o) => <li key={o.code} role="option" aria-selected={o.code === lang}>
            <button className={o.code === lang ? "active" : ""} onClick={() => chooseLang(o.code)} dir={o.rtl ? "rtl" : "ltr"}>{o.label}{o.code === lang && <b aria-hidden="true">✓</b>}</button>
          </li>)}
        </ul>}
      </div>
    </header>

    <div className="dash-main">
      {view === "cuisine" ? <div className="dash-columns">
        <section className="dash-column" style={{ background: "#FFEBEE" }}>
          <h2><b style={{ background: "#E53935" }} />{t.colNew}</h2>
          <div className="dash-cards">{nouvelles.length === 0 ? <p className="dash-empty">{t.emptyNew}</p> : nouvelles.map((o) => <OrderCard key={o.id} order={o} now={now} newFlag={newIds.has(o.id)} onAction={act} currency={currency} t={t} lang={lang} />)}</div>
        </section>
        <section className="dash-column" style={{ background: "#FFF3E0" }}>
          <h2><b style={{ background: "#FB8C00" }} />{t.colPreparing}</h2>
          <div className="dash-cards">{preparation.length === 0 ? <p className="dash-empty">{t.emptyPreparing}</p> : preparation.map((o) => <OrderCard key={o.id} order={o} now={now} newFlag={false} onAction={act} currency={currency} t={t} lang={lang} />)}</div>
        </section>
        <section className="dash-column" style={{ background: "#E8F5E9" }}>
          <h2><b style={{ background: "#388E3C" }} />{t.colReady}</h2>
          <div className="dash-cards">{pretesLivrees.length === 0 ? <p className="dash-empty">{t.emptyReady}</p> : pretesLivrees.map((o) => <OrderCard key={o.id} order={o} now={now} newFlag={false} onAction={act} currency={currency} t={t} lang={lang} />)}</div>
        </section>
      </div> : view === "reception" ? <div className="dash-column" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
        <h2>{t.arrivalsStays} <small className="dash-pms-tag">🔗 Apaleo</small></h2>
        <div className="dash-resa-list">{reservationsError ? <p className="dash-empty">{t.pmsDown}</p> : reservations.length === 0 ? <p className="dash-empty">{t.noArrivals}</p> : reservations.map((r) => <ReservationRow key={r.id} r={r} t={t} />)}</div>
        <h2 style={{ marginTop: "24px" }}>{t.toHandle}</h2>
        <div className="dash-rooms">{receptionTasks.length === 0 ? <p className="dash-empty">{t.noRequest}</p> : receptionTasks.map((o) => <ReceptionCard key={o.id} order={o} now={now} newFlag={newIds.has(o.id)} onAction={act} t={t} lang={lang} />)}</div>
        <h2 style={{ marginTop: "24px" }}>{t.otherNotifs}</h2>
        <div className="dash-rooms">{receptionNotices.length === 0 ? <p className="dash-empty">{t.noNotif}</p> : receptionNotices.map((o) => <ReceptionCard key={o.id} order={o} now={now} newFlag={newIds.has(o.id)} onAction={act} t={t} lang={lang} />)}</div>
      </div> : view === "chambres" ? <div className="dash-column" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
        <h2>{t.occupiedRooms}</h2>
        <div className="dash-rooms">{rooms.length === 0 ? <p className="dash-empty">{t.noActiveRoom}</p> : rooms.map((r) => <RoomCard key={r.chambre} room={r} currency={currency} t={t} lang={lang} />)}</div>
      </div> : view === "stats" ? <div className="dash-column dash-stats-full" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
        <div className="dash-stats-full-header">
          <h2>{t.detailedStats}</h2>
          <div className="dash-stats-full-header-right">
            <div className="dash-period-toggle">
              <button className={statsCategory === "cuisine" ? "active" : ""} onClick={() => setStatsCategory("cuisine")}>{t.catKitchen}</button>
              <button className={statsCategory === "reception" ? "active" : ""} onClick={() => setStatsCategory("reception")}>{t.catHousekeeping}</button>
            </div>
            <div className="dash-period-toggle">
              <button className={statsPeriod === "jour" ? "active" : ""} onClick={() => setStatsPeriod("jour")}>{t.periodDay}</button>
              <button className={statsPeriod === "semaine" ? "active" : ""} onClick={() => setStatsPeriod("semaine")}>{t.periodWeek}</button>
              <button className={statsPeriod === "mois" ? "active" : ""} onClick={() => setStatsPeriod("mois")}>{t.periodMonth}</button>
            </div>
            <button className="dash-seed-btn" onClick={() => seedDemoActivity(config)}>{t.simulateActivity}</button>
          </div>
        </div>
        <div className="dash-stats-summary">
          <div><span>{statsCategory === "cuisine" ? t.orders : t.requests}</span><b>{periodOrders.length}</b></div>
          <div><span>{t.revenue}</span><b>{periodTotal} {currency}</b></div>
          <div><span>{statsCategory === "cuisine" ? t.distinctItems : t.requestTypes}</span><b>{itemStats.length}</b></div>
        </div>
        <h3 className="dash-stats-subtitle">{t.revenueTrend}</h3>
        <RevenueTrend data={trendData} currency={currency} />
        <h3 className="dash-stats-subtitle">{statsCategory === "cuisine" ? t.everythingOrdered : t.mostRequested}</h3>
        <div className="dash-stats-bars">
          {itemStats.length === 0 ? <p className="dash-empty">{statsCategory === "cuisine" ? t.noOrdersPeriod : t.noRequestsPeriod}</p> : itemStats.map((it) => (
            <div className="dash-bar-row" key={it.nom}>
              <span className="dash-bar-label">{translateOrderName(it.nom, lang)}</span>
              <div className="dash-bar-track"><div className="dash-bar-fill" style={{ width: `${maxQty ? Math.round((it.qty / maxQty) * 100) : 0}%` }} /></div>
              <span className="dash-bar-value">{it.qty}× · {it.revenue} {currency}</span>
            </div>
          ))}
        </div>
      </div> : view === "chat" ? <div className="dash-column dash-chat-full" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
        <div className="dash-chat-list">
          <div className="dash-chat-list-header">
            <h2>{t.conversations}</h2>
            <button className="dash-seed-btn" onClick={() => seedDemoChats(config)}>{t.simulateChats}</button>
          </div>
          {conversations.length === 0 ? <p className="dash-empty">{t.noConversation}</p> : conversations.map((c) => {
            const preview = c.messages[c.messages.length - 1];
            return <button key={c.room} className={`dash-chat-item${selectedRoom === c.room ? " active" : ""}`} onClick={() => setSelectedRoom(c.room)}>
              <div className="dash-chat-item-top"><strong>{t.room(c.room)}</strong>{c.lastFrom === "client" && <b className="dash-toggle-dot" />}</div>
              <span className="dash-chat-item-guest">{c.guest}</span>
              <span className="dash-chat-item-preview">{preview.from === "reception" ? t.you : ""}{preview.text}</span>
            </button>;
          })}
        </div>
        <div className="dash-chat-thread">
          {selectedRoom == null || !conversations.some((c) => c.room === selectedRoom) ? <p className="dash-empty">{t.pickConversation}</p> : (() => {
            const conv = conversations.find((c) => c.room === selectedRoom)!;
            return <>
              <div className="dash-chat-thread-header"><strong>{t.room(conv.room)}</strong><span>{conv.guest}</span></div>
              <div className="dash-chat-thread-body">{conv.messages.map((m) => <div key={m.id} className={`dash-chat-bubble ${m.from}`}>{m.text}</div>)}</div>
              <div className="dash-quick-replies">{t.quickReplies.map((qr) => <button key={qr} className="dash-quick-reply" onClick={() => setChatReply(qr)}>{qr}</button>)}</div>
              <div className="dash-chat-thread-input">
                <input value={chatReply} onChange={(e) => setChatReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder={t.replyPlaceholder} />
                <button onClick={sendReply}>{t.send}</button>
              </div>
            </>;
          })()}
        </div>
      </div> : <div className="dash-column dash-history-full" style={{ background: "var(--paper)", border: "1px solid var(--border)" }}>
        <h2>{t.historyToday}</h2>
        {historiqueRooms.length === 0 ? <p className="dash-empty">{t.noDeliveredToday}</p> : <div className="dash-rooms">{historiqueRooms.map((r) => <HistoriqueRoomCard key={r.chambre} room={r} currency={currency} t={t} lang={lang} />)}</div>}
      </div>}

      <aside className="dash-sidebar">
        <div className="dash-panel"><h3>{t.todayStats}</h3>
          <div className="dash-stat"><span>{t.totalOrders}</span><b>{stats.total}</b></div>
          <div className="dash-stat"><span>{t.revenue}</span><b>{stats.ca} {currency}</b></div>
          <div className="dash-stat"><span>{t.avgTime}</span><b>{t.minShort(stats.tempsMoyen)}</b></div>
          <div className="dash-stat"><span>{t.topDish}</span><b>{stats.plat === "—" ? "—" : translateOrderName(stats.plat, lang)}</b></div>
          <button className="dash-stats-link" onClick={() => setView("stats")}>{t.seeAllStats}</button>
        </div>
        <div className="dash-panel"><h3>{t.lastDelivered}</h3>
          <div className="dash-history">{historique.length === 0 ? <p className="dash-empty">{t.noDelivered}</p> : historique.map((o) => <div key={o.id} className="dash-history-row"><b>{t.room(o.chambre)}</b><span>{o.total} {currency} · {o.heure}</span></div>)}</div>
          <button className="dash-stats-link" onClick={() => setView("historique")}>{t.seeAllHistory}</button>
        </div>
      </aside>
    </div>
  </div>;
}
