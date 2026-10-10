"use client";

import "../app/kiosk-refinements.css";
import "../app/kiosk-group.css";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig, wifiName, getCurrency } from "@/lib/config";
import { getStayPeriod, languageOptions, pickTranslation, type Lang } from "@/lib/i18n";
import { useOrders, addOrder, clearRoomOrders, getUnpaidBill } from "@/lib/orders";
import { stayServices, suiteOptions, taxeSejour, computeServicePrice, unitPriceLabel, formatPrice, serviceName } from "@/lib/services";
import { useWeather, weatherLabel } from "@/lib/weather";
import { kioskCopy } from "@/lib/i18n/kiosk";
import type { ApaleoReservation } from "@/lib/apaleo";

type ScreenId =
  | "welcome" | "languages" | "arrival" | "reservation" | "scan"
  | "chambrePasPrete" | "confirmation" | "upgrade" | "services" | "basket" | "recap"
  | "tax" | "payment" | "paymentLoading" | "paymentAccepted" | "print"
  | "keys" | "final" | "departure" | "taxi" | "taxiConfirm" | "time"
  | "cash" | "paymentRefused" | "backOffice"
  | "departureRecap" | "departurePayment" | "departurePaymentLoading"
  | "departurePaymentAccepted" | "departurePaymentRefused" | "departureCash"
  | "groupLookup" | "groupFound" | "groupPayer";

const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
function today() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} - ${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
}

function floorLabel(lang: Lang, floor: number): string {
  const words: Record<Lang, string> = { fr: "Étage", en: "Floor", es: "Planta", de: "Etage", it: "Piano", ar: "الطابق" };
  return `${words[lang]} ${floor}`;
}

function Brand() {
  return <div className="brand" aria-label="Checkly Hotel Technology">
    <strong>CHECKLY</strong><i /><small>HOTEL TECHNOLOGY</small>
  </div>;
}

function Heading({ title, intro, brand = true }: { title: string; intro?: string; brand?: boolean }) {
  return <div className="screen-heading">{brand && <Brand />}<h1>{title}</h1>{intro && <p>{intro}</p>}<i /></div>;
}

function Button({ children, onClick, filled = true, className = "", disabled = false }: { children: React.ReactNode; onClick: () => void; filled?: boolean; className?: string; disabled?: boolean }) {
  return <motion.button whileHover={disabled ? undefined : { scale: 1.02 }} whileTap={disabled ? undefined : { scale: .98 }} className={`figma-button ${filled ? "filled" : "outline"} ${className}`} onClick={onClick} disabled={disabled}>{children}</motion.button>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>;
}

function CashIcon() {
  return <svg className="icon-cash" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5.5 9h.01M18.5 15h.01"/></svg>;
}

function Frame({ children, onBack, canGoBack, autoCursor }: { children: React.ReactNode; onBack: () => void; canGoBack: boolean; autoCursor?: { x: number; y: number; clicking: boolean } | null }) {
  return <div className="canvas-shell">
    <div className="figma-canvas">
      <div className="figma-card" />
      <time className="figma-date">{today()}</time>
      {canGoBack && <motion.button className="back-arrow" aria-label="Retour à l'écran précédent" onClick={onBack} whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}>←</motion.button>}
      {children}
      {autoCursor && <div className={`auto-cursor${autoCursor.clicking ? " clicking" : ""}`} style={{ left: `${autoCursor.x}%`, top: `${autoCursor.y}%` }} />}
    </div>
  </div>;
}

const ROOM_BASE_TOTAL = 1180;

// Simulated group booking used by the demo: one payer, several rooms (not read from the PMS).
const GROUP = {
  name: "Martin",
  payerFirst: "Claire",
  payerRoom: 301,
  floor: 3,
  rooms: [
    { number: 301, kind: "deluxe" as const, adults: 2, amount: 1180 },
    { number: 302, kind: "deluxe" as const, adults: 2, amount: 1180 },
    { number: 303, kind: "single" as const, adults: 1, amount: 760 },
  ],
};
const GROUP_ADULTS = GROUP.rooms.reduce((sum, r) => sum + r.adults, 0);
const GROUP_ROOMS_TOTAL = GROUP.rooms.reduce((sum, r) => sum + r.amount, 0);

export default function Kiosk() {
  const config = useConfig();
  const currency = getCurrency(config.country);
  const { orders } = useOrders();
  const [lang, setLang] = useState<Lang>("fr");
  const t = kioskCopy[lang];
  const stay = getStayPeriod(3, lang);
  const [groupMode, setGroupMode] = useState(false);
  const ctx = useMemo(() => ({ nights: stay.nights, guests: groupMode ? GROUP_ADULTS : config.guests, currency }), [stay.nights, config.guests, currency, groupMode]);
  const weather = useWeather(config.city);
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});
  const [cardCount, setCardCount] = useState<number | null>(config.guests);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [taxiTime, setTaxiTime] = useState("10:30");
  const [reservation, setReservation] = useState("");
  const [autoPick, setAutoPick] = useState<string | null>(null);
  const [forceNotReady, setForceNotReady] = useState(false);
  const roomIsReady = !forceNotReady;
  const orderedRef = useRef(false);
  const [pmsReservation, setPmsReservation] = useState<ApaleoReservation | null>(null);
  const [pmsSearching, setPmsSearching] = useState(false);
  const [pmsCheckin, setPmsCheckin] = useState<"idle" | "done" | "failed">("idle");
  const [pmsNoted, setPmsNoted] = useState(false);
  const [groupName, setGroupName] = useState("");
  const go = (id: ScreenId) => {
    setHistory((current) => [...current, screen]);
    setScreen(id);
    setAutoPick(null);
  };
  const goBack = () => {
    if (history.length === 0) return;
    if (screen === "groupFound") setGroupMode(false);
    setScreen(history[history.length - 1]);
    setHistory((current) => current.slice(0, -1));
  };
  const goToConfirmation = async () => {
    setPmsSearching(true);
    try {
      const res = await fetch("/api/pms/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastName: reservation }),
      });
      const data = await res.json();
      setPmsReservation(data.found ? data.reservation : null);
    } catch {
      setPmsReservation(null);
    } finally {
      setPmsSearching(false);
    }
    go(roomIsReady ? "confirmation" : "chambrePasPrete");
  };
  const groupDisplayName = (groupName.trim() || GROUP.name).toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase());
  const groupPayerName = `${GROUP.payerFirst} ${groupDisplayName}`;
  const confirmGroup = () => {
    setGroupMode(true);
    setPmsReservation(null);
    setCardCount(GROUP.rooms.length);
    go("groupFound");
  };
  const setServiceQty = (id: string, qty: number, maxQty = 1) => setSelectedServices((current) => ({ ...current, [id]: Math.max(0, Math.min(maxQty, qty)) }));
  const toggleService = (id: string) => setServiceQty(id, selectedServices[id] ? 0 : 1);

  const basketLines = useMemo(() => {
    const lines: Array<{ id: string; nom: string; unitLabel: string; detailLabel: string; total: number }> = [];
    if (selectedUpgrade) {
      const suite = suiteOptions.find((s) => s.id === selectedUpgrade);
      if (suite) {
        const svc = { id: suite.id, nom: suite.nom, icone: "", prix: suite.prix, pricingType: suite.pricingType };
        const { total, detailLabel } = computeServicePrice(svc, ctx, 1, lang);
        lines.push({ id: suite.id, nom: suite.nom, unitLabel: unitPriceLabel(svc, currency, lang), detailLabel, total });
      }
    }
    stayServices.forEach((service) => {
      const qty = selectedServices[service.id] ?? 0;
      if (qty <= 0) return;
      const { total, detailLabel } = computeServicePrice(service, ctx, qty, lang);
      lines.push({ id: service.id, nom: serviceName(service, lang), unitLabel: unitPriceLabel(service, currency, lang), detailLabel, total });
    });
    return lines;
  }, [selectedUpgrade, selectedServices, ctx, currency, lang]);
  const basketItemCount = basketLines.length;
  const removeBasketItem = (id: string) => id === selectedUpgrade ? setSelectedUpgrade(null) : setServiceQty(id, 0);
  const servicesTotal = useMemo(() => basketLines.reduce((sum, line) => sum + line.total, 0), [basketLines]);
  const total = ROOM_BASE_TOTAL + servicesTotal;
  const taxResult = useMemo(() => computeServicePrice(taxeSejour, ctx, 1, lang), [ctx, lang]);
  const taxTotal = taxResult.total;
  const groupTax = useMemo(() => computeServicePrice(taxeSejour, { ...ctx, guests: GROUP_ADULTS }, 1, lang).total, [ctx, lang]);
  const groupTotal = GROUP_ROOMS_TOTAL + servicesTotal + groupTax;
  const dueNow = groupMode ? groupTotal : total + taxTotal;
  const stayBill = useMemo(() => getUnpaidBill(orders, config.room), [orders, config.room]);
  const receptionNote = useMemo(() => {
    const upgrade = basketLines.find((line) => line.id === selectedUpgrade);
    const extras = basketLines.filter((line) => line.id !== selectedUpgrade);
    const parts: string[] = [];
    if (upgrade) parts.push(`Upgrade demandé : ${suiteOptions.find((s) => s.id === upgrade.id)?.nom ?? upgrade.nom} (${formatPrice(upgrade.total, currency)})`);
    if (extras.length > 0) parts.push(`Services ajoutés : ${extras.map((line) => `${stayServices.find((s) => s.id === line.id)?.nom ?? line.nom} (${formatPrice(line.total, currency)})`).join(", ")}`);
    return parts.length > 0 ? `[Borne Checkly] ${parts.join(" | ")}` : undefined;
  }, [basketLines, selectedUpgrade, currency]);

  const resetSelections = () => {
    orderedRef.current = false;
    setSelectedServices({});
    setSelectedUpgrade(null);
    setCardCount(config.guests);
    setReservation("");
    setForceNotReady(false);
    setPmsReservation(null);
    setPmsCheckin("idle");
    setPmsNoted(false);
    setGroupMode(false);
    setGroupName("");
  };
  const resetJourney = () => {
    clearRoomOrders(config.room);
    resetSelections();
  };

  useEffect(() => {
    if (screen !== "taxiConfirm") return;
    const t = setTimeout(() => go("departurePayment"), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  useEffect(() => {
    if (screen !== "print" || orderedRef.current) return;
    orderedRef.current = true;
    if (pmsReservation) {
      fetch("/api/pms/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pmsReservation.id, note: receptionNote }) })
        .then(async (res) => { const data = await res.json().catch(() => ({})); setPmsCheckin(res.ok ? "done" : "failed"); setPmsNoted(Boolean(data.noted)); })
        .catch(() => setPmsCheckin("failed"));
    }
    if (groupMode) {
      addOrder([{ nom: `Check-in groupe : ${GROUP.rooms.length} chambres, 1 seul paiement`, emoji: "◆", qty: 1, prix: 0 }], 0, "reception", "nouveau", true, { chambre: GROUP.payerRoom, client: groupPayerName });
    }
    basketLines.forEach((line) => {
      addOrder([{ nom: line.nom, emoji: "◆", qty: 1, prix: line.total }], line.total, "sejour", "livre", true, groupMode ? { chambre: GROUP.payerRoom, client: groupPayerName } : undefined);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const [autoDemoMode, setAutoDemoMode] = useState<"in" | "out" | "group" | null>(null);
  const [autoCursor, setAutoCursor] = useState<{ x: number; y: number; clicking: boolean } | null>(null);
  const autoStepIndex = useRef(0);
  useEffect(() => {
    if (!autoDemoMode) return;
    let cancelled = false;
    const checkinSteps: Array<{ x: number; y: number; action: () => void }> = [
      { x: 50, y: 68, action: () => go("languages") },
      { x: 24, y: 44, action: () => go("arrival") },
      { x: 28, y: 62, action: () => go("reservation") },
      { x: 30, y: 46, action: () => setReservation(config.guestLast.toUpperCase()) },
      { x: 30, y: 58, action: () => go("confirmation") },
      { x: 46, y: 64, action: () => { setCardCount(config.guests); setAutoPick(`card-${config.guests}`); } },
      { x: 50, y: 73, action: () => go("upgrade") },
      { x: 27, y: 64, action: () => { setSelectedUpgrade("suite-junior"); setAutoPick("upgrade-suite-junior"); } },
      { x: 50, y: 90, action: () => go("services") },
      { x: 70, y: 41, action: () => { toggleService("spa"); setAutoPick("service-spa"); } },
      { x: 50, y: 90, action: () => go("basket") },
      { x: 50, y: 90, action: () => go("recap") },
      { x: 50, y: 91, action: () => go("tax") },
      { x: 50, y: 88, action: () => go("payment") },
      { x: 36, y: 50, action: () => go("paymentLoading") },
      { x: 50, y: 72, action: () => go("paymentAccepted") },
      { x: 50, y: 72, action: () => go("print") },
      { x: 50, y: 72, action: () => go("keys") },
      { x: 50, y: 88, action: () => go("final") },
    ];
    const groupSteps: Array<{ x: number; y: number; action: () => void }> = [
      { x: 50, y: 68, action: () => go("languages") },
      { x: 24, y: 44, action: () => go("arrival") },
      { x: 28, y: 62, action: () => go("reservation") },
      { x: 50, y: 85, action: () => { setAutoPick("group-link"); } },
      { x: 50, y: 85, action: () => go("groupLookup") },
      { x: 50, y: 50, action: () => setGroupName(GROUP.name.toUpperCase()) },
      { x: 50, y: 63, action: () => confirmGroup() },
      { x: 50, y: 88, action: () => go("upgrade") },
      { x: 27, y: 64, action: () => { setSelectedUpgrade("suite-junior"); setAutoPick("upgrade-suite-junior"); } },
      { x: 50, y: 90, action: () => go("services") },
      { x: 70, y: 41, action: () => { toggleService("spa"); setAutoPick("service-spa"); } },
      { x: 50, y: 90, action: () => go("basket") },
      { x: 50, y: 90, action: () => go("groupPayer") },
      { x: 50, y: 88, action: () => go("payment") },
      { x: 36, y: 50, action: () => go("paymentLoading") },
      { x: 50, y: 72, action: () => go("paymentAccepted") },
      { x: 50, y: 72, action: () => go("print") },
      { x: 50, y: 72, action: () => go("keys") },
      { x: 50, y: 88, action: () => go("final") },
    ];
    const checkoutSteps: Array<{ x: number; y: number; action: () => void }> = [
      { x: 50, y: 68, action: () => go("languages") },
      { x: 24, y: 44, action: () => go("arrival") },
      { x: 72, y: 62, action: () => go("departure") },
      { x: 50, y: 90, action: () => go("departureRecap") },
      { x: 50, y: 90, action: () => go("departurePayment") },
      { x: 36, y: 50, action: () => go("departurePaymentLoading") },
      { x: 50, y: 72, action: () => go("departurePaymentAccepted") },
      { x: 50, y: 72, action: () => go("welcome") },
    ];
    const steps = autoDemoMode === "in" ? checkinSteps : autoDemoMode === "group" ? groupSteps : checkoutSteps;
    const runStep = () => {
      if (cancelled) return;
      if (autoStepIndex.current >= steps.length) {
        autoStepIndex.current = 0;
        setAutoCursor(null);
        resetJourney();
        setTimeout(runStep, 4500);
        return;
      }
      const step = steps[autoStepIndex.current];
      setAutoCursor({ x: step.x, y: step.y, clicking: false });
      const t1 = setTimeout(() => {
        if (cancelled) return;
        setAutoCursor({ x: step.x, y: step.y, clicking: true });
        const t2 = setTimeout(() => {
          if (cancelled) return;
          step.action();
          autoStepIndex.current += 1;
          setTimeout(runStep, 1900);
        }, 350);
        return () => clearTimeout(t2);
      }, 1100);
      return () => clearTimeout(t1);
    };
    autoStepIndex.current = 0;
    const t = setTimeout(runStep, 700);
    return () => { cancelled = true; clearTimeout(t); setAutoCursor(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDemoMode]);

  useEffect(() => {
    const handleArrow = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", handleArrow);
    return () => window.removeEventListener("keydown", handleArrow);
  }, [goBack]);

  const content = (() => {
    switch (screen) {
      case "welcome": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><button className="welcome-screen" onClick={() => { resetSelections(); go("languages"); }}>
        <div className="welcome-content"><p>{config.hotelName}</p><strong>CHECKLY</strong><span>{config.city.toUpperCase()} · {config.country.toUpperCase()}</span>{weather && <span className="welcome-weather">{weatherLabel(weather.code, lang).icon} {weather.tempC}° · {weatherLabel(weather.code, lang).text}</span>}<h1>{t.welcomeTitle}</h1><small>{t.welcomeSubtitle}</small><motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="tap-icon"><img src="/figma/welcome-tap.svg" alt=""/><img src="/figma/welcome-hand.svg" alt={t.welcomeTapAlt}/></motion.span></div>
      </button></Frame>;
      case "languages": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="language-screen"><Heading title={t.selectLanguage} brand={false}/><div className="language-cards">{languageOptions.map(({ code, label }) => <button key={code} className={lang === code ? "active" : ""} onClick={() => { setLang(code); go("arrival"); }}>{label}</button>)}</div></section></Frame>;
      case "arrival": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="arrival-screen"><Brand/><p className="location">{config.city} - {config.country}</p><i className="title-line"/><p className="prompt">{t.howCanIHelp}</p><div className="arrival-cards"><button className="check-in" onClick={() => go("reservation")}><h2>{t.checkIn}</h2><p>{t.checkInDesc.split("\n")[0]}<br/>{t.checkInDesc.split("\n")[1]}</p><span>{t.start}</span></button><b>{t.or}</b><button className="check-out" onClick={() => go("departure")}><h2>{t.checkOut}</h2><p>{t.checkOutDesc.split("\n")[0]}<br/>{t.checkOutDesc.split("\n")[1]}</p><span>{t.start}</span></button></div></section></Frame>;
      case "reservation": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="reservation-screen"><Heading title={t.findReservation} intro={t.findReservationIntro}/><div className="lookup-grid"><div className="lookup-card"><label>{t.lastName}<input value={reservation} onChange={(event) => setReservation(event.target.value)} placeholder="DUBOIS"/></label><Button disabled={pmsSearching} onClick={goToConfirmation}>{pmsSearching ? "…" : t.continueBtn}</Button></div><b>{t.or}</b><button className="qr-card" onClick={() => go("scan")}><span>⌗</span><strong>{t.scanMyQr}</strong><small>{t.scanMyQrDesc}</small></button></div><button className={`group-link${autoPick === "group-link" ? " auto-pick" : ""}`} onClick={() => go("groupLookup")}>{t.groupLink} →</button></section></Frame>;
      case "scan": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="scan-screen"><Heading title={t.scanQrTitle} intro={t.scanQrIntro}/><div className="scanner"><div className="scan-laser"/><span>⌗</span></div><p>{t.scanningInProgress}</p><Button onClick={goToConfirmation}>{t.iScannedMyCode}</Button></section></Frame>;
      case "chambrePasPrete": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="wait-mark">◷</span><Heading title={t.roomNotReadyTitle} intro={t.roomNotReadyIntro} brand={false}/><Button onClick={() => go("confirmation")}>{t.continueAnyway}</Button></section></Frame>;
      case "confirmation": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="confirmation-screen"><span className="success-mark">✓</span><Heading title={t.hello(pmsReservation ? `${pmsReservation.guestFirstName} ${pmsReservation.guestLastName}` : config.guestFirst)} intro={t.confirmationIntro(stay.short, stay.nights, config.guests)} brand={false}/><div className="confirmation-card"><div><small>{t.roomLabel}</small><strong>{pmsReservation?.roomName || "Deluxe Lake View"}</strong><p>{t.roomFloorView}</p>{pmsReservation && <p className="pms-tag">🔗 {pmsReservation.guestEmail || t.pmsConnected(pmsReservation.propertyName)}</p>}</div><div><small>{t.arrivalLabel}</small><strong>{t.arrivalFrom}</strong><p className={roomIsReady ? "room-status-ready" : "room-status-wait"}>{roomIsReady ? t.roomReady : t.roomNotReady}</p></div><div><small>{t.yourKeyLabel}</small><strong>{cardCount ? t.cardsCount(cardCount) : t.toSelect}</strong><p>{t.pickupAtKiosk}</p></div></div><p className="count-question">{t.howManyCards} <span className="count-hint">{t.preselectedHint(config.guests)}</span></p><div className="number-pills">{[1,2,3,4].map((number) => <button className={`${cardCount === number ? "selected" : ""} ${autoPick === `card-${number}` ? "auto-pick" : ""}`} onClick={() => setCardCount(number)} key={number}>{number}</button>)}</div><Button className="confirmation-continue" disabled={!cardCount} onClick={() => go("upgrade")}>{t.continueBtn}</Button></section></Frame>;
      case "upgrade": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="upgrade-screen"><Heading title={t.upgradeTitle} intro={groupMode ? t.groupUpgradeIntro(GROUP.payerRoom) : t.upgradeIntro(stay.range)}/><div className="suite-grid">{suiteOptions.map((suite, index) => { const svc = { id: suite.id, nom: suite.nom, icone: "", prix: suite.prix, pricingType: suite.pricingType }; return <article key={suite.id} className={index === 0 ? "popular" : ""}><div className="suite-image">{index === 0 && <span>{t.popular}</span>}</div><h2>{suite.nom}</h2><p>{pickTranslation(lang, suite.detail, { en: suite.detailEn, es: suite.detailEs, de: suite.detailDe, it: suite.detailIt, ar: suite.detailAr })}</p><strong>{unitPriceLabel(svc, currency, lang)}</strong><motion.button className={`figma-button filled ${selectedUpgrade === suite.id ? "added" : ""} ${autoPick === `upgrade-${suite.id}` ? "auto-pick" : ""}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} animate={selectedUpgrade === suite.id ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: .32 }} onClick={() => setSelectedUpgrade(selectedUpgrade === suite.id ? null : suite.id)}>{selectedUpgrade === suite.id ? t.added : t.upgradeBtn}</motion.button></article>; })}</div><button className="skip-link" onClick={() => go("services")}>{t.noThanksKeepRoom}</button><Button className="upgrade-continue" onClick={() => go("services")}>{t.continueBtn}</Button><button className="upgrade-cart" aria-label={`${t.viewMyCart}, ${basketItemCount} ${basketItemCount > 1 ? "items" : "item"}`} onClick={() => go("basket")}><CartIcon/><span>{basketItemCount}</span></button></section></Frame>;
      case "services": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="services-screen"><Heading title={t.servicesTitle} intro={t.servicesIntro}/><div className="service-grid">{stayServices.slice(0, 6).map((service) => {
        const qty = selectedServices[service.id] ?? 0;
        const isStepped = (service.maxQty ?? 1) > 1;
        const body = <><span>{service.icone}</span><strong>{serviceName(service, lang)}</strong><small>{unitPriceLabel(service, currency, lang)}</small></>;
        if (isStepped) {
          return <div key={service.id} className={`stepped ${qty > 0 ? "chosen" : ""} ${autoPick === `service-${service.id}` ? "auto-pick" : ""}`} onClick={qty === 0 ? () => setServiceQty(service.id, 1, service.maxQty) : undefined}>
            {body}
            {qty > 0
              ? <div className="service-stepper"><button aria-label="Remove a slot" onClick={(e) => { e.stopPropagation(); setServiceQty(service.id, qty - 1, service.maxQty); }}>−</button><span>{qty * (service.dureeHeures ?? 1)}h</span><button aria-label="Add a slot" onClick={(e) => { e.stopPropagation(); setServiceQty(service.id, qty + 1, service.maxQty); }}>+</button></div>
              : <i>{t.addPlus}</i>}
          </div>;
        }
        return <button key={service.id} className={`${qty > 0 ? "chosen" : ""} ${autoPick === `service-${service.id}` ? "auto-pick" : ""}`} onClick={() => toggleService(service.id)}>
          {body}<i>{qty > 0 ? t.added : t.addPlus}</i>
        </button>;
      })}</div><Button onClick={() => go("basket")}>{t.viewMyCart}</Button></section></Frame>;
      case "basket": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="basket-screen"><Heading title={t.basketTitle} intro={t.basketIntro}/><div className="basket-list detailed">{basketLines.length === 0 ? <p>{t.noServiceSelected}</p> : basketLines.map((line) => {
        const isFlat = line.unitLabel === line.detailLabel;
        return <div key={line.id} className="basket-line">
          <div className="basket-line-head"><span>{line.nom}</span><button onClick={() => removeBasketItem(line.id)}>{t.remove}</button></div>
          {!isFlat && <div className="basket-line-unit">{line.unitLabel}</div>}
          <div className="basket-line-calc"><span>{isFlat ? t.flatRate : line.detailLabel}</span><strong>{formatPrice(line.total, currency)}</strong></div>
        </div>;
      })}</div><div className="basket-total"><span>{basketLines.length === 0 ? t.reservationPrice : t.totalStay}</span><strong>{formatPrice(groupMode ? GROUP_ROOMS_TOTAL + servicesTotal : total, currency)}</strong></div><Button onClick={() => go(groupMode ? "groupPayer" : "recap")}>{t.continueBtn}</Button></section></Frame>;
      case "recap": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="recap-screen"><Heading title={t.recapTitle} intro={t.recapIntro(config.hotelName)}/><div className="recap-grid"><article><span>⌂</span><h2>{t.roomWord}</h2><p>Deluxe Lake View<br/>{floorLabel(lang, config.floor)}</p></article><article><span>▣</span><h2>{t.parkingWord}</h2><p>{t.reservedSpot}<br/>{t.accessFrom}</p></article><article><span>⌁</span><h2>{t.servicesWord}</h2><p>{t.servicesConfirmed(basketItemCount).split("\n")[0]}<br/>{t.servicesConfirmed(basketItemCount).split("\n")[1]}</p></article><article><span>⌁</span><h2>{t.wifiWord}</h2><p>{wifiName(config)}<br/>{t.complimentaryConnection}</p></article></div><div className="map-card"><strong>{t.roomReadyPeriod}</strong><p>{t.pickupCardsReceptionNote}</p></div><Button onClick={() => go("tax")}>{t.proceedToPayment}</Button></section></Frame>;
      case "tax": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="tax-screen"><Heading title={t.taxTitle} intro={t.taxIntro(config.city)}/><div className="tax-card"><div><small>{t.nightsAdultsLabel(stay.nights, config.guests)}</small><strong>{t.taxTitle}</strong><p>{taxResult.detailLabel}</p></div><b>{formatPrice(taxTotal, currency)}</b></div><Button onClick={() => go("payment")}>{t.acceptAndContinue}</Button></section></Frame>;
      case "payment": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="payment-screen"><Heading title={t.paymentTitle} intro={t.choosePaymentMethod}/><div className="payment-choices"><button onClick={() => go("paymentLoading")}><span>▣</span><strong>{t.creditCard}</strong><small>{t.contactlessChipPin}</small></button><button onClick={() => go("cash")}><span><CashIcon/></span><strong>{t.cashWord}</strong><small>{t.paymentAtFrontDesk}</small></button></div><p className="amount">{t.amountDue} <strong>{formatPrice(dueNow, currency)}</strong></p></section></Frame>;
      case "paymentLoading": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="machine-screen"><Heading title={t.presentYourCard} intro={t.tapOrInsertCard}/><motion.div className="terminal-device" animate={{ opacity: [1,.55,1] }} transition={{ repeat: Infinity, duration: 1.3 }}><span>◒</span><p>{t.terminalReady}</p></motion.div><Button onClick={() => go("paymentAccepted")}>{t.paymentCompleted}</Button>{process.env.NODE_ENV !== "production" && <button className="minor-link" onClick={() => go("paymentRefused")}>{t.simulateDecline}</button>}</section></Frame>;
      case "paymentAccepted": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="success-mark large">✓</span><Heading title={t.paymentAcceptedTitle} intro={t.amountChargedSuccess(formatPrice(dueNow, currency))} brand={false}/><Button onClick={() => go("print")}>{t.printMyCards}</Button></section></Frame>;
      case "paymentRefused": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="error-mark">!</span><Heading title={t.paymentRefusedTitle} intro={t.paymentRefusedIntro} brand={false}/><Button onClick={() => go("payment")}>{t.tryAgain}</Button></section></Frame>;
      case "cash": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="cash-screen"><Heading title={t.cashPaymentTitle} intro={t.cashPaymentIntro}/><div className="reference">CHEEKLY-0622<br/><small>{formatPrice(dueNow, currency)}</small></div><Button onClick={() => go("print")}>{t.paymentConfirmedFrontDesk}</Button></section></Frame>;
      case "print": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="machine-screen"><Heading title={t.preparingCardsTitle} intro={t.preparingCardsIntro(cardCount ?? 1)}/><motion.div className="printer" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.3 }}><i/><i/><i/></motion.div><Button onClick={() => go("keys")}>{t.cardsReady}</Button></section></Frame>;
      case "keys": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="keys-screen"><Heading title={t.cardsReadyTitle} intro={t.cardsReadyIntro}/><div className="key-stack">{Array.from({ length: cardCount ?? 1 }).map((_, index) => <div key={index}><small>{config.hotelName.toUpperCase()}</small><strong>{groupMode ? GROUP.rooms[index % GROUP.rooms.length].number : config.room}</strong><span>{groupMode && GROUP.rooms[index % GROUP.rooms.length].kind === "single" ? t.groupRoomSingle.toUpperCase() : t.deluxeLakeView}</span></div>)}</div><Button onClick={() => go("final")}>{t.iCollectedMyCards}</Button></section></Frame>;
      case "final": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="success-mark large">✓</span><Heading title={t.finalTitle(config.hotelName)} intro={t.finalIntro(config.city)} brand={false}/>{groupMode && <p className="pms-checkin-note">✓ {t.groupFinalRooms(GROUP.rooms.length)}<br/>✓ {t.groupFinalBill(GROUP.payerRoom)}</p>}{pmsCheckin === "done" && <p className="pms-checkin-note">✓ {t.pmsCheckedIn}{pmsNoted && <><br/>✓ {t.pmsNoteSent}</>}</p>}<Button onClick={() => go("welcome")}>{t.finish}</Button></section></Frame>;
      case "groupLookup": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="reservation-screen"><Heading title={t.groupLookupTitle} intro={t.groupLookupIntro}/><div className="lookup-grid group-lookup-grid"><div className="lookup-card"><label>{t.lastName}<input value={groupName} onChange={(event) => setGroupName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") confirmGroup(); }} placeholder={GROUP.name.toUpperCase()}/></label><Button onClick={confirmGroup}>{t.continueBtn}</Button></div></div></section></Frame>;
      case "groupFound": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="group-screen"><span className="success-mark">✓</span><Heading title={t.groupFoundTitle} intro={t.groupFoundIntro(groupDisplayName, GROUP.rooms.length, stay.nights)} brand={false}/><div className="group-list">{GROUP.rooms.map((room) => <div className="group-room" key={room.number}><b>{room.number}</b><div><strong>{room.kind === "single" ? t.groupRoomSingle : "Deluxe Lake View"}</strong><small>{floorLabel(lang, GROUP.floor)} · {t.groupAdults(room.adults)}</small></div><span className="group-ready">{t.groupRoomReady}</span></div>)}</div><Button onClick={() => go("upgrade")}>{t.groupCheckinAll(GROUP.rooms.length)}</Button></section></Frame>;
      case "groupPayer": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="group-screen"><Heading title={t.groupPayTitle} intro={t.groupPayIntro(GROUP.payerRoom)} brand={false}/><div className="group-pay"><div className="group-payer"><small>{t.groupPayerLabel}</small><strong>{groupPayerName}</strong><span>{t.roomWord} {GROUP.payerRoom}</span></div>{GROUP.rooms.map((room) => <div className="group-line" key={room.number}><span>{t.roomWord} {room.number} · {room.kind === "single" ? t.groupRoomSingle : "Deluxe Lake View"}</span><b>{formatPrice(room.amount, currency)}</b></div>)}{basketLines.length > 0 && <div className="group-line group-extras"><span>{t.groupExtras(basketLines.length)}<small>{basketLines.map((l) => l.nom).join(", ")}</small></span><b>{formatPrice(servicesTotal, currency)}</b></div>}<div className="group-line"><span>{t.taxTitle}</span><b>{formatPrice(groupTax, currency)}</b></div><div className="group-line group-total"><span>{t.groupTotalLabel}</span><b>{formatPrice(groupTotal, currency)}</b></div></div><Button onClick={() => go("payment")}>{t.groupPayBtn(formatPrice(groupTotal, currency))}</Button></section></Frame>;
      case "departure": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="departure-screen"><Heading title={t.departureTitle} intro={t.departureIntro}/><div className="departure-grid"><button onClick={() => go("taxi")}><span>▰</span><strong>{t.orderTaxi}</strong><small>{t.orderTaxiDesc}</small></button></div><Button onClick={() => go("departureRecap")}>{t.finalizeCheckout}</Button></section></Frame>;
      case "taxi": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="taxi-screen"><Heading title={t.taxiTitle} intro={t.taxiIntro}/><div className="taxi-info"><label>{t.destinationLabel}<select><option>{t.genevaAirport}</option><option>{t.lausanneStation}</option><option>{t.cityCenter}</option></select></label><label>{t.departureTimeLabel}<button onClick={() => go("time")}>{taxiTime} · {t.change}</button></label></div><Button onClick={() => go("taxiConfirm")}>{t.bookThisTaxi}</Button></section></Frame>;
      case "taxiConfirm": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><motion.span className="success-mark large" initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .35 }}>✓</motion.span><Heading title={t.taxiBookedTitle} intro={t.taxiBookedIntro(taxiTime)} brand={false}/></section></Frame>;
      case "departureRecap": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="basket-screen"><Heading title={t.departureRecapTitle} intro={t.departureRecapIntro}/><div className="basket-list">{stayBill.lines.length === 0 ? <p>{t.noServicesRecorded}</p> : stayBill.lines.map((line) => <div key={line.id}><span>{line.label}</span><strong>{line.total === 0 ? t.free : formatPrice(line.total, currency)}</strong></div>)}</div><div className="basket-total"><span>{t.totalDue}</span><strong>{formatPrice(stayBill.total, currency)}</strong></div><Button onClick={() => go("departurePayment")}>{t.proceedToPayment}</Button></section></Frame>;
      case "departurePayment": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="payment-screen"><Heading title={t.settleStayTitle} intro={t.choosePaymentMethod}/><div className="payment-choices"><button onClick={() => go("departurePaymentLoading")}><span>▣</span><strong>{t.creditCard}</strong><small>{t.contactlessChipPin}</small></button><button onClick={() => go("departureCash")}><span><CashIcon/></span><strong>{t.cashWord}</strong><small>{t.paymentAtFrontDesk}</small></button></div><p className="amount">{t.amountDue} <strong>{formatPrice(stayBill.total, currency)}</strong></p></section></Frame>;
      case "departurePaymentLoading": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="machine-screen"><Heading title={t.presentYourCard} intro={t.tapOrInsertCard}/><motion.div className="terminal-device" animate={{ opacity: [1,.55,1] }} transition={{ repeat: Infinity, duration: 1.3 }}><span>◒</span><p>{t.terminalReady}</p></motion.div><Button onClick={() => go("departurePaymentAccepted")}>{t.paymentCompleted}</Button>{process.env.NODE_ENV !== "production" && <button className="minor-link" onClick={() => go("departurePaymentRefused")}>{t.simulateDecline}</button>}</section></Frame>;
      case "departurePaymentAccepted": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="success-mark large">✓</span><Heading title={t.thanksForStay} intro={t.amountChargedSuccess(formatPrice(stayBill.total, currency))} brand={false}/><div className="return-card-note">{t.returnCardNote}</div><Button onClick={() => { clearRoomOrders(config.room); go("welcome"); }}>{t.finish}</Button></section></Frame>;
      case "departurePaymentRefused": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="result-screen"><span className="error-mark">!</span><Heading title={t.paymentRefusedTitle} intro={t.paymentRefusedIntro} brand={false}/><Button onClick={() => go("departurePayment")}>{t.tryAgain}</Button></section></Frame>;
      case "departureCash": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="cash-screen"><Heading title={t.cashPaymentTitle} intro={t.cashPaymentIntro}/><div className="reference">CHEEKLY-0622<br/><small>{formatPrice(stayBill.total, currency)}</small></div><Button onClick={() => go("departurePaymentAccepted")}>{t.paymentConfirmedFrontDesk}</Button></section></Frame>;
      case "time": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="time-screen"><Heading title={t.timeTitle} intro={t.timeIntro}/><div className="time-display">{taxiTime}</div><div className="time-grid">{["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"].map((value) => <button className={taxiTime === value ? "selected" : ""} onClick={() => setTaxiTime(value)} key={value}>{value}</button>)}</div><Button onClick={() => go("taxi")}>{t.confirmTime}</Button></section></Frame>;
      case "backOffice": return <Frame onBack={goBack} canGoBack={history.length > 0} autoCursor={autoCursor}><section className="backoffice-screen"><Heading title={t.backOfficeTitle} intro={t.backOfficeIntro}/><div className="backoffice-grid"><article><small>{t.checkinsToday}</small><strong>42</strong></article><article><small>{t.cardsPrinted}</small><strong>76</strong></article><article><small>{t.paymentsPending}</small><strong>3</strong></article><article><small>{t.support}</small><strong>24/7</strong></article></div><Button onClick={() => go("welcome")}>{t.backToKiosk}</Button></section></Frame>;
    }
  })();

  return <main className="kiosk">
    <motion.div key={screen} initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}>{content}</motion.div>
    <div className="auto-demo-buttons">
      <button className={`auto-demo-btn${autoDemoMode === "in" ? " active" : ""}`} onClick={() => { const starting = autoDemoMode !== "in"; setAutoDemoMode(starting ? "in" : null); if (starting) { autoStepIndex.current = 0; setHistory([]); setScreen("welcome"); } }}>{autoDemoMode === "in" ? "■ Arrêter" : "▶ Démo check-in"}</button>
      <button className={`auto-demo-btn${autoDemoMode === "out" ? " active" : ""}`} onClick={() => { const starting = autoDemoMode !== "out"; setAutoDemoMode(starting ? "out" : null); if (starting) { autoStepIndex.current = 0; setHistory([]); setScreen("welcome"); } }}>{autoDemoMode === "out" ? "■ Arrêter" : "▶ Démo check-out"}</button>
      <button className={`auto-demo-btn${autoDemoMode === "group" ? " active" : ""}`} onClick={() => { const starting = autoDemoMode !== "group"; setAutoDemoMode(starting ? "group" : null); if (starting) { autoStepIndex.current = 0; resetSelections(); setHistory([]); setScreen("welcome"); } }}>{autoDemoMode === "group" ? "■ Arrêter" : "▶ Démo groupe"}</button>
      <button className="auto-demo-btn" onClick={() => { setAutoDemoMode(null); setAutoCursor(null); autoStepIndex.current = 0; resetSelections(); setForceNotReady(true); setHistory([]); setScreen("chambrePasPrete"); }}>▶ Démo chambre pas prête</button>
    </div>
  </main>;
}
