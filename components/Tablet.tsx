"use client";

import "../app/tablet.css";
import { useEffect, useMemo, useState } from "react";
import { useConfig, guestFullName, getCurrency } from "@/lib/config";
import { languageOptions, type Lang } from "@/lib/i18n";
import { getActivities } from "@/lib/activities";
import {
  restaurationSections, boissonSections, produitSections,
  menuItemName, menuItemDesc, sectionLabel, allergenLabel,
  type MenuItem, type MenuSection,
} from "@/lib/menu";
import { formatPrice } from "@/lib/services";
import {
  addOrder, updateOrderStatus, deleteOrder, useOrders, getStayBill, orderStatusLabel,
  type OrderItem,
} from "@/lib/orders";
import { useWeather, weatherLabel } from "@/lib/weather";
import { useChatMessages, sendChatMessage } from "@/lib/chat";
import { tabletCopy } from "@/lib/i18n/tablet";
import { translateServiceLabel } from "@/lib/i18n/serviceLabels";

function translatedOption(item: MenuItem, i: number, lang: Lang): string | undefined {
  const byLang: Record<Lang, string[] | undefined> = { fr: item.options, en: item.optionsEn, es: item.optionsEs, de: item.optionsDe, it: item.optionsIt, ar: item.optionsAr };
  return byLang[lang]?.[i];
}



type Section = "restauration" | "boissons" | "produits";
type ScreenId =
  | "veille" | "langue" | "menu"
  | "categorie" | "liste" | "fiche"
  | "menageMenu" | "menageHeure" | "menageClavier"
  | "panier" | "panierConfirmer" | "panierLoading" | "panierConfirmee" | "suiviCommande"
  | "conciergeMenu" | "infosHotel" | "planHotel" | "meteo"
  | "chatLoading" | "chatActif"
  | "sejourMenu" | "reveil" | "lateCheckout" | "evaluation" | "noteSejour";

type CartLine = { key: string; nom: string; emoji: string; prix: number; qty: number; option?: string; kind: "cuisine" | "reception" };
type Popup = { icon: string; text: string };

const sectionMeta: Record<Section, { sections: MenuSection[] }> = {
  restauration: { sections: restaurationSections },
  boissons: { sections: boissonSections },
  produits: { sections: produitSections },
};

const statusOrder = ["nouveau", "en_preparation", "en_route", "livre"] as const;
const SERVICE_KEYS = new Set(["menage-heure", "late-checkout", "Ménage immédiat", "Changer les draps"]);



function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L21 8H7" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
}

function NoteIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /><path d="M8 12h8M8 15.5h8M8 8.5h4" /></svg>;
}

function Header({ title, onBack, canGoBack, cartCount, onCart, noteTotal, currency, onNote, backLabel, noteLabel, cartLabel }: { title: string; onBack: () => void; canGoBack: boolean; cartCount: number; onCart: () => void; noteTotal: number; currency: string; onNote: () => void; backLabel: string; noteLabel: string; cartLabel: string }) {
  return <div className="tab-header">
    {canGoBack ? <button className="tab-back" aria-label={backLabel} onClick={onBack}>←</button> : <div className="tab-back" style={{ visibility: "hidden" }} />}
    <h1>{title}</h1>
    <div className="tab-header-actions">
      <button className="tab-note-btn" aria-label={`${noteLabel}, ${formatPrice(noteTotal, currency)}`} onClick={onNote}><NoteIcon /><span>{formatPrice(noteTotal, currency)}</span></button>
      <button className="tab-cart-btn" aria-label={`${cartLabel}, ${cartCount}`} onClick={onCart}><CartIcon /><span>{cartCount}</span></button>
    </div>
  </div>;
}

function Loading({ text }: { text: string }) {
  return <div className="tab-loading"><strong>CHECKLY</strong><div className="tab-spinner" /><p>{text}</p></div>;
}

export default function Tablet() {
  const [lang, setLang] = useState<Lang>("fr");
  const t = tabletCopy[lang];
  const [screen, setScreen] = useState<ScreenId>("veille");
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [clock, setClock] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("restauration");
  const [activeCategory, setActiveCategory] = useState<MenuSection | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [itemQty, setItemQty] = useState(1);
  const [itemOption, setItemOption] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [clavierValue, setClavierValue] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const allChatMessages = useChatMessages();
  const [reveilH, setReveilH] = useState(7);
  const [reveilM, setReveilM] = useState(0);
  const [planFilter, setPlanFilter] = useState(0);
  const [evalStars, setEvalStars] = useState(0);
  const [evalTags, setEvalTags] = useState<string[]>([]);
  const [evalComment, setEvalComment] = useState("");
  const [evalSent, setEvalSent] = useState(false);
  const { orders } = useOrders();
  const config = useConfig();
  const client = { nom: guestFullName(config), chambre: config.room, etage: config.floor };
  const currency = getCurrency(config.country);
  const stayBill = useMemo(() => getStayBill(orders, config.room), [orders, config.room]);
  const weather = useWeather(config.city);
  const chatMessages = useMemo(() => allChatMessages.filter((m) => m.room === config.room).sort((a, b) => a.timestamp - b.timestamp), [allChatMessages, config.room]);

  const go = (id: ScreenId) => { setHistory((h) => [...h, screen]); setScreen(id); };
  const replace = (id: ScreenId) => setScreen(id);
  const goBack = () => { if (history.length === 0) return; setScreen(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); };
  const showPopup = (icon: string, text: string, ms = 2200) => { setPopup({ icon, text }); setTimeout(() => setPopup(null), ms); };

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const greeting = new Date().getHours() >= 19 ? t.goodEvening : t.goodMorning;

  useEffect(() => {
    if (screen === "panierLoading") { const tm = setTimeout(() => { setHistory([]); replace("panierConfirmee"); }, 1200); return () => clearTimeout(tm); }
  }, [screen]);

  useEffect(() => {
    if (screen === "chatLoading") {
      const tm = setTimeout(() => {
        if (chatMessages.length === 0) sendChatMessage(client.chambre, client.nom, "reception", t.greetingBotMsg);
        replace("chatActif");
      }, 1100);
      return () => clearTimeout(tm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.prix * l.qty, 0), [cart]);
  const currentOrder = orders.find((o) => o.id === currentOrderId) || null;

  const addToCart = (item: { id: string; nom: string; emoji: string; prix: number }, qty: number, option: string | null, kind: "cuisine" | "reception") => {
    const key = item.id + (option ? `-${option}` : "");
    const isService = SERVICE_KEYS.has(key);
    setCart((c) => {
      const existing = c.find((l) => l.key === key);
      if (existing) return c.map((l) => (l.key === key ? { ...l, qty: isService ? 1 : l.qty + qty } : l));
      return [...c, { key, nom: item.nom, emoji: item.emoji, prix: item.prix, qty: isService ? 1 : qty, option: option || undefined, kind }];
    });
  };
  const setLineQty = (key: string, qty: number) => setCart((c) => qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty: SERVICE_KEYS.has(key) ? 1 : qty } : l)));

  const openCategorie = (section: Section) => { setActiveSection(section); go("categorie"); };
  const openListe = (cat: MenuSection) => { setActiveCategory(cat); go("liste"); };
  const openFiche = (item: MenuItem) => { setActiveItem(item); setItemQty(1); setItemOption(item.options ? item.options[0] : null); go("fiche"); };
  const ajouterProduit = (item: MenuItem) => { addToCart({ id: item.id, nom: menuItemName(item, lang), emoji: item.emoji, prix: item.prix }, 1, null, "reception"); showPopup("✓", t.deliveryNote(client.chambre)); };

  const menageHeureLine = cart.find((l) => l.key === "menage-heure");
  const ajouterServiceMenage = (nom: string, emoji: string) => { addToCart({ id: nom, nom, prix: 0, emoji }, 1, null, "reception"); showPopup("✓", t.addedConfirmInOrder); };

  const dndEvents = orders.filter((o) => o.articles.some((a) => a.nom === "Ne pas déranger" || a.nom === "Fin du mode Ne pas déranger"));
  const lastDndEvent = [...dndEvents].sort((a, b) => b.timestamp - a.timestamp)[0];
  const dndActive = lastDndEvent?.articles[0]?.nom === "Ne pas déranger";
  const toggleDnd = () => {
    if (dndActive) { addOrder([{ nom: "Fin du mode Ne pas déranger", emoji: "🔔", qty: 1, prix: 0 }], 0, "reception"); showPopup("🔔", t.dndOffMsg); }
    else { addOrder([{ nom: "Ne pas déranger", emoji: "🚫", qty: 1, prix: 0 }], 0, "reception"); showPopup("🚫", t.dndOnMsg); }
  };

  const lateCheckoutOrdered = orders.some((o) => o.articles.some((a) => a.nom.startsWith("Late check-out")));

  const isMenageArticle = (nom: string) => nom === "Ménage immédiat" || nom === "Changer les draps" || /^Ménage à \d{2}:\d{2}$/.test(nom);
  const pendingMenageOrders = orders.filter((o) => o.kind === "reception" && o.statut !== "livre" && o.articles.length === 1 && isMenageArticle(o.articles[0].nom));
  const activeMenage = [...pendingMenageOrders].sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
  const activeMenageHeureTime = activeMenage && /^Ménage à \d{2}:\d{2}$/.test(activeMenage.articles[0].nom) ? activeMenage.articles[0].nom.replace("Ménage à ", "") : null;
  const menageImmediatActive = pendingMenageOrders.some((o) => o.articles[0].nom === "Ménage immédiat");
  const changerDrapsActive = pendingMenageOrders.some((o) => o.articles[0].nom === "Changer les draps");

  const activeReveil = [...orders].filter((o) => o.articles.length === 1 && /^Réveil à \d{2}:\d{2}$/.test(o.articles[0].nom)).sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
  const activeReveilTime = activeReveil ? activeReveil.articles[0].nom.replace("Réveil à ", "") : null;
  const applyReveil = (h: string) => {
    if (activeReveil) deleteOrder(activeReveil.id);
    addOrder([{ nom: `Réveil à ${h}`, emoji: "⏰", qty: 1, prix: 0 }], 0, "reception");
    showPopup("⏰", activeReveil ? t.alarmUpdatedMsg : t.alarmSetMsg);
    goBack();
  };
  const cancelReveil = () => {
    if (activeReveil) deleteOrder(activeReveil.id);
    showPopup("✓", t.alarmCancelledMsg);
    goBack();
  };

  const openReveil = () => {
    if (activeReveilTime) {
      const [h, m] = activeReveilTime.split(":").map(Number);
      setReveilH(h);
      setReveilM(m);
    }
    go("reveil");
  };

  const choisirHeureMenage = (h: string) => {
    setCart((c) => [...c.filter((l) => l.key !== "menage-heure"), { key: "menage-heure", nom: `Ménage à ${h}`, emoji: "◷", prix: 0, qty: 1, kind: "reception" }]);
    showPopup("✓", t.addedAt(h));
  };

  const confirmerCommande = () => {
    const toArticles = (lines: CartLine[]): OrderItem[] => lines.map((l) => ({ nom: l.nom + (l.option ? ` (${l.option})` : ""), emoji: l.emoji, qty: l.qty, prix: l.prix }));
    const serviceLines = cart.filter((l) => l.kind === "reception");
    const foodLines = cart.filter((l) => l.kind === "cuisine");
    const serviceTotal = serviceLines.reduce((s, l) => s + l.prix * l.qty, 0);
    const foodTotal = foodLines.reduce((s, l) => s + l.prix * l.qty, 0);

    let mainOrder = null;
    if (foodLines.length > 0) mainOrder = addOrder(toArticles(foodLines), foodTotal, "cuisine");
    if (serviceLines.length > 0) {
      const receptionOrder = addOrder(toArticles(serviceLines), serviceTotal, "reception");
      if (!mainOrder) mainOrder = receptionOrder;
    }
    if (mainOrder) setCurrentOrderId(mainOrder.id);
    setCart([]);
    go("panierLoading");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(client.chambre, client.nom, "client", chatInput.trim());
    setChatInput("");
  };

  const wrap = (title: string, node: React.ReactNode) => <>
    <Header title={title} onBack={goBack} canGoBack={history.length > 0} cartCount={cart.length} onCart={() => go("panier")} noteTotal={stayBill.total} currency={currency} onNote={() => go("noteSejour")} backLabel={t.back} noteLabel={t.myStayBill} cartLabel={t.yourCart} />
    <div className="tab-content">{node}</div>
  </>;

  const content = (() => {
    switch (screen) {
      case "veille": return <button className="tab-veille" onClick={() => go("langue")}>
        <span className="tab-hotel">{config.hotelName}</span><strong>CHECKLY</strong><i /><span className="tab-loc">{config.city.toUpperCase()} · {config.country.toUpperCase()}</span>
        {weather && <span className="tab-weather-line">{weatherLabel(weather.code, lang).icon} {weather.tempC}° · {weatherLabel(weather.code, lang).text}</span>}
        <h1>{greeting},<br />{client.nom.split(" ")[0]}</h1><small>{t.touchToAccess}</small>
        <div className="tab-pulse">↓</div>
        <div className="tab-footer">{t.footer(client.chambre)}</div>
      </button>;

      case "langue": return wrap(t.selectLanguage, <div className="tab-lang-grid">{languageOptions.map(({ code, label }) => <button key={code} className={lang === code ? "active" : ""} onClick={() => { setLang(code); go("menu"); }}>{label}</button>)}</div>);

      case "menu": return <>
        <div className="tab-menu-header"><div className="tab-greet"><strong>{greeting}, {client.nom.split(" ")[0]}</strong><span>{t.room(client.chambre)}</span></div>
          <div className="tab-header-actions">
            <button className="tab-note-btn" aria-label={`${t.myStayBill}, ${formatPrice(stayBill.total, currency)}`} onClick={() => go("noteSejour")}><NoteIcon /><span>{formatPrice(stayBill.total, currency)}</span></button>
            <button className="tab-cart-btn" aria-label={t.yourCart} onClick={() => go("panier")}><CartIcon /><span>{cart.length}</span></button>
          </div></div>
        {currentOrder && currentOrder.kind === "cuisine" && currentOrder.statut !== "livre" && <button className="tab-order-banner" onClick={() => go("suiviCommande")}>
          <span className="tab-dot" style={{ background: "#8b7355" }} />
          <div><strong>{t.order(String(currentOrder.id).slice(-4))}</strong><span>{orderStatusLabel(currentOrder.statut, lang)}</span></div>
          <span className="tab-arrow">→</span>
        </button>}
        {activeReveil && <button className="tab-order-banner" onClick={openReveil}>
          <span className="tab-dot" style={{ background: "var(--gold)" }} />
          <div><strong>{t.wakeUpCall}</strong><span>{t.scheduledAt(activeReveilTime!)}</span></div>
          <span className="tab-arrow">→</span>
        </button>}
        {activeMenage && <button className="tab-order-banner" onClick={() => go("menageMenu")}>
          <span className="tab-dot" style={{ background: "var(--brown)" }} />
          <div><strong>{translateServiceLabel(activeMenage.articles[0].nom, lang)}</strong><span>{t.requestSent}</span></div>
          <span className="tab-arrow">→</span>
        </button>}
        <div className="tab-content"><div className="tab-grid-2">
          <button className="tab-cat-card" onClick={() => openCategorie("restauration")}><span className="tab-icon">🍴</span><strong>{t.restauration}</strong><small>{t.restaurationDesc}</small></button>
          <button className="tab-cat-card" onClick={() => openCategorie("boissons")}><span className="tab-icon">🍷</span><strong>{t.boissons}</strong><small>{t.boissonsDesc}</small></button>
          <button className="tab-cat-card" onClick={() => openCategorie("produits")}><span className="tab-icon">🧴</span><strong>{t.produits}</strong><small>{t.produitsDesc}</small></button>
          <button className="tab-cat-card" onClick={() => go("menageMenu")}><span className="tab-icon">🧹</span><strong>{t.menage}</strong><small>{t.menageDesc}</small></button>
          <button className="tab-cat-card" onClick={() => go("conciergeMenu")}><span className="tab-icon">💬</span><strong>{t.concierge}</strong><small>{t.conciergeDesc}</small></button>
          <button className="tab-cat-card" onClick={() => go("sejourMenu")}><span className="tab-icon">⏰</span><strong>{t.monSejour}</strong><small>{t.monSejourDesc}</small></button>
        </div></div></>;

      case "categorie": return wrap(t[activeSection], <div className="tab-grid-2">{sectionMeta[activeSection].sections.map((s) => <button key={s.id} className="tab-cat-card" onClick={() => openListe(s)}><span className="tab-icon">{s.icon}</span><strong>{sectionLabel(s, lang)}</strong><small>{t.itemsCount(s.items.length)}</small></button>)}</div>);

      case "liste": return wrap(activeCategory ? sectionLabel(activeCategory, lang) : "", <div className="tab-grid-2">{(activeCategory?.items || []).map((item) => <div key={item.id} className="tab-item-card" onClick={() => activeSection === "produits" ? ajouterProduit(item) : openFiche(item)}>
        <div className="tab-item-photo">{item.emoji}</div>
        <div className="tab-item-body"><strong>{menuItemName(item, lang)}</strong><b>{item.prix === 0 ? t.free : `${item.prix} ${currency}`}</b>
          <div className="tab-add">{activeSection === "produits" ? t.request : t.viewAdd}</div></div>
      </div>)}</div>);

      case "fiche": return activeItem && wrap(menuItemName(activeItem, lang), <>
        <div className="tab-fiche-photo">{activeItem.emoji}</div>
        {activeItem.desc && <p className="tab-p">{menuItemDesc(activeItem, lang)}</p>}
        {!!activeItem.allergenes?.length && <div className="tab-pills">{activeItem.allergenes.map((a) => <span key={a} className="tab-pill">{allergenLabel(a, lang)}</span>)}</div>}
        {!!activeItem.options && <div className="tab-pills">{activeItem.options.map((o, i) => <span key={o} className={`tab-pill select${itemOption === o ? " active" : ""}`} onClick={() => setItemOption(o)}>{translatedOption(activeItem, i, lang) ?? o}</span>)}</div>}
        <div className="tab-qty-row"><button onClick={() => setItemQty((q) => Math.max(1, q - 1))}>−</button><span>{itemQty}</span><button onClick={() => setItemQty((q) => q + 1)}>+</button></div>
        <button className="tab-btn" onClick={() => { addToCart({ id: activeItem.id, nom: menuItemName(activeItem, lang), emoji: activeItem.emoji, prix: activeItem.prix }, itemQty, itemOption, "cuisine"); showPopup("✓", t.addedToCartExcl); goBack(); }}>{t.addToCart(`${activeItem.prix * itemQty} ${currency}`)}</button>
      </>);

      case "menageMenu": return wrap(t.housekeepingComfort, <div className="tab-grid-2">
        <button className="tab-cat-card" disabled={menageImmediatActive} onClick={() => ajouterServiceMenage("Ménage immédiat", "🧹")}><span className="tab-icon">🧹</span><strong>{t.now}</strong><small>{menageImmediatActive ? t.alreadyRequested : t.cleaningUnder15}</small></button>
        <button className="tab-cat-card" onClick={() => go("menageHeure")}><span className="tab-icon">🕐</span><strong>{t.chooseATime}</strong><small>{menageHeureLine ? t.scheduledAt(menageHeureLine.nom.replace("Ménage à ", "")) : activeMenageHeureTime ? t.scheduledAt(activeMenageHeureTime) : t.scheduleASlot}</small></button>
        <button className={`tab-cat-card${dndActive ? " active" : ""}`} onClick={toggleDnd}><span className="tab-icon">{dndActive ? "🔔" : "🚫"}</span><strong>{dndActive ? t.allowHousekeeping : t.doNotDisturb}</strong><small>{dndActive ? t.currentlyActive : t.off}</small></button>
        <button className="tab-cat-card" disabled={changerDrapsActive} onClick={() => ajouterServiceMenage("Changer les draps", "🛏️")}><span className="tab-icon">🛏️</span><strong>{t.changeSheets}</strong><small>{changerDrapsActive ? t.alreadyRequested : t.freshLinen}</small></button>
      </div>);

      case "menageHeure": return wrap(t.chooseATime, <>
        <p className="tab-eyebrow">{t.morning}</p><div className="tab-pills">{["09h00", "10h00", "11h00"].map((h) => <span key={h} className="tab-pill select" onClick={() => { choisirHeureMenage(h); goBack(); }}>{h}</span>)}</div>
        <p className="tab-eyebrow" style={{ marginTop: "4cqw" }}>{t.afternoon}</p><div className="tab-pills">{["12h00", "13h00", "14h00", "15h00", "16h00", "17h00"].map((h) => <span key={h} className="tab-pill select" onClick={() => { choisirHeureMenage(h); goBack(); }}>{h}</span>)}</div>
        <button className="tab-btn outline" style={{ marginTop: "4cqw" }} onClick={() => go("menageClavier")}>{t.enterDifferentTime}</button>
      </>);

      case "menageClavier": return wrap(t.enterATime, <>
        <div className="tab-clock"><span>{clavierValue || "--:--"}</span></div>
        <div className="tab-grid-2" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: "2.4cqw" }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].map((k) => <button key={k} className="tab-cat-card" style={{ minHeight: "12cqw", alignItems: "center", justifyContent: "center", textAlign: "center" }} onClick={() => {
            if (k === "⌫") return setClavierValue((v) => v.slice(0, -1));
            if (k === "OK") { if (clavierValue) { choisirHeureMenage(clavierValue); setClavierValue(""); replace("menageMenu"); } return; }
            setClavierValue((v) => (v.replace(/\D/g, "").length >= 4 ? v : v + k));
          }}><strong style={{ fontSize: "4cqw" }}>{k}</strong></button>)}
        </div>
      </>);

      case "panier": return wrap(t.yourCart, cart.length === 0 ? <div className="tab-cart-empty"><span>—</span><p>{t.cartEmpty}</p><button className="tab-btn outline" onClick={() => go("menu")}>{t.backToMenu}</button></div> : <>
        {cart.map((l) => <div key={l.key} className="tab-cart-row"><span className="tab-emoji">{l.emoji}</span><span className="tab-name">{translateServiceLabel(l.nom, lang)}{l.option ? ` (${l.option})` : ""}</span>
          {SERVICE_KEYS.has(l.key)
            ? <button className="tab-remove-line" onClick={() => setLineQty(l.key, 0)}>{t.remove}</button>
            : <div className="tab-stepper"><button onClick={() => setLineQty(l.key, l.qty - 1)}>−</button><span>{l.qty}</span><button onClick={() => setLineQty(l.key, l.qty + 1)}>+</button></div>}
          <span className="tab-price">{l.prix === 0 ? t.free : `${l.prix * l.qty} ${currency}`}</span></div>)}
        <div className="tab-cart-total"><span>{t.total}</span><strong>{cartTotal} {currency}</strong></div>
        <button className="tab-btn" onClick={() => go("panierConfirmer")}>{t.orderArrow}</button>
      </>);

      case "panierConfirmer": {
        const cartIsService = cart.length > 0 && cart.every((l) => l.kind === "reception");
        return wrap(t.confirmOrder, <>
          <div className="tab-recap-card"><div><span>{t.chamber}</span><b>{client.chambre}</b></div><div><span>{cartIsService ? t.processing : t.estimatedTime}</span><b>{cartIsService ? t.frontDeskImmediate : "25-35 min"}</b></div><div><span>{t.billing}</span><b>{t.stayBill}</b></div></div>
          <div className="tab-cart-total"><span>{t.total}</span><strong>{cartTotal} {currency}</strong></div>
          <button className="tab-btn" onClick={confirmerCommande}>{cartIsService ? t.confirmMyRequest : t.confirmMyOrder}</button>
        </>);
      }

      case "panierLoading": return <Loading text={currentOrder?.kind === "reception" ? t.sendingToFrontDesk : t.sendingToKitchen} />;

      case "panierConfirmee": return wrap(currentOrder?.kind === "reception" ? t.requestSent : t.orderSent, <div className="tab-confirmed"><div className="tab-check">✓</div><p className="tab-p">{currentOrder?.kind === "reception" ? t.requestReceivedNote : t.orderSentToKitchen(client.chambre)}</p>{currentOrder?.kind === "reception" ? <button className="tab-btn" onClick={() => replace("menu")}>{t.backToMenu}</button> : <button className="tab-btn" onClick={() => replace("suiviCommande")}>{t.trackMyOrder}</button>}</div>);

      case "suiviCommande": {
        const idx = currentOrder ? statusOrder.indexOf(currentOrder.statut) : -1;
        const steps = [{ label: t.stepReceived, i: 0 }, { label: t.stepPreparing, i: 1 }, { label: t.stepDelivering, i: 2 }, { label: t.stepDelivered, i: 3 }];
        const enLivraison = currentOrder?.statut === "en_route";
        const livree = currentOrder?.statut === "livre";
        return wrap(t.orderTracking, !currentOrder ? <p className="tab-p">{t.noOrderInProgress}</p> : <>
          <p className="tab-p">{t.orderRef(String(currentOrder.id).slice(-4), currentOrder.heure)}</p>
          <div className={`tab-steps${enLivraison ? " pending-confirm" : ""}`}>{steps.map((s) => <div key={s.label} className={`tab-step${idx > s.i ? " done" : idx === s.i ? " current" : ""}`}><span className="tab-dot" /><div><strong>{s.label}</strong>{idx === s.i && <small>{t.inProgress}</small>}</div></div>)}</div>
          {enLivraison && <button className="tab-btn tab-confirm-receipt" onClick={() => updateOrderStatus(currentOrder.id, "livre")}>{t.iReceivedMyOrder}</button>}
          {livree && <div className="tab-delivered-badge">{t.delivered}</div>}
          <button className="tab-btn outline" style={{ marginTop: "4cqw" }} onClick={() => replace("menu")}>{t.backToMenu}</button>
        </>);
      }

      case "noteSejour": return wrap(t.myStayBill, <>
        {stayBill.lines.length === 0 ? <p className="tab-p">{t.noChargesYet}</p> : <div className="tab-note-list">{stayBill.lines.map((l) => <div key={l.id} className={`tab-note-row${l.total === 0 ? " free" : ""}`}><span>{translateServiceLabel(l.label, lang)}</span><strong>{l.total === 0 ? t.free : formatPrice(l.total, currency)}</strong></div>)}</div>}
        <div className="tab-note-total"><span>{t.totalStay}</span><strong>{formatPrice(stayBill.total, currency)}</strong></div>
      </>);

      case "conciergeMenu": return wrap(t.concierge, <div className="tab-grid-2">
        <button className="tab-cat-card" onClick={() => go("infosHotel")}><span className="tab-icon">🏨</span><strong>{t.hotelInfo}</strong><small>{t.hoursServices}</small></button>
        <button className="tab-cat-card" onClick={() => go("planHotel")}><span className="tab-icon">🗺️</span><strong>{t.hotelMap}</strong><small>{t.findYourWay}</small></button>
        <button className="tab-cat-card" onClick={() => go("meteo")}><span className="tab-icon">☀️</span><strong>{t.weatherActivities}</strong><small>{t.andSurroundings(config.city)}</small></button>
        <button className="tab-cat-card" onClick={() => go("chatLoading")}><span className="tab-icon">💬</span><strong>{t.frontDeskChat}</strong><small>{t.writeToUs}</small></button>
      </div>);

      case "infosHotel": return wrap(t.hotelInfo, <>
        {config.hotelInfo.filter((item) => item.enabled).map((item) => <div key={item.id} className="tab-info-card"><div className="tab-info-photo" style={item.image ? { backgroundImage: `url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} /><div className="tab-info-scrim" /><div className="tab-info-text"><strong>{item.title}</strong><span>{item.hours}</span></div></div>)}
      </>);

      case "planHotel": return wrap(t.hotelMapTitle, <>
        <div className="tab-filters">{t.floorFilters.map((f, i) => <button key={f} className={planFilter === i ? "active" : ""} onClick={() => setPlanFilter(i)}>{f}</button>)}</div>
        <div className="tab-plan-box">{t.simulatedMap(t.floorFilters[planFilter])}</div>
        {[t.pool, t.spaLoc, t.restaurantLoc, t.roomFloor(client.chambre, client.etage)].map((line) => <div key={line} className="tab-info-row"><span className="tab-emoji">•</span><strong>{line}</strong></div>)}
      </>);

      case "meteo": return wrap(t.weatherActivities, <>
        <div className="tab-weather-card"><div className="tab-temp">{weather ? `${weather.tempC}°C` : "—"}</div><p style={{ margin: "1cqw 0 0", opacity: .9 }}>{config.city}, {config.country}</p>
          <div className="tab-weather-days">{[t.today, t.tomorrow, t.dayAfterTomorrow].map((d, i) => <div key={d}><div>{d}</div><div>{weather?.dailyMax[i] != null ? `${weather.dailyMax[i]}°` : "—"}</div></div>)}</div></div>
        {getActivities(config.city, lang).map((a) => <div key={a} className="tab-info-row"><span className="tab-emoji">•</span><strong>{a}</strong></div>)}
      </>);

      case "chatLoading": return <Loading text={t.connecting} />;

      case "chatActif": return <>
        <Header title={t.frontDeskChat} onBack={goBack} canGoBack={history.length > 0} cartCount={cart.length} onCart={() => go("panier")} noteTotal={stayBill.total} currency={currency} onNote={() => go("noteSejour")} backLabel={t.back} noteLabel={t.myStayBill} cartLabel={t.yourCart} />
        <div className="tab-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <p className="tab-eyebrow">{t.onlineTranslation}</p>
          <div className="tab-chat-body" style={{ flex: 1 }}>{chatMessages.map((m) => <div key={m.id} className={`tab-bubble ${m.from === "client" ? "envoye" : "recu"}`}>{m.text}</div>)}</div>
          <div className="tab-chat-input"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder={t.writeMessage} /><button onClick={sendChat}>{t.send}</button></div>
        </div>
      </>;

      case "sejourMenu": return wrap(t.monSejour, <div className="tab-grid-2">
        <button className="tab-cat-card" onClick={openReveil}><span className="tab-icon">⏰</span><strong>{t.wakeUpCall}</strong><small>{activeReveilTime ? t.scheduledAt(activeReveilTime) : t.setAlarm}</small></button>
        <button className="tab-cat-card" disabled={lateCheckoutOrdered} onClick={() => go("lateCheckout")}><span className="tab-icon">🧳</span><strong>{t.lateCheckout}</strong><small>{lateCheckoutOrdered ? t.alreadyRequested : t.extendUntil2pm}</small></button>
        <button className="tab-cat-card" onClick={() => go("evaluation")}><span className="tab-icon">⭐</span><strong>{t.rateMyStay}</strong><small>{t.yourOpinionMatters}</small></button>
      </div>);

      case "reveil": return wrap(t.wakeUpCall, <>
        <div className="tab-clock"><span>{String(reveilH).padStart(2, "0")}:{String(reveilM).padStart(2, "0")}</span></div>
        <div className="tab-time-row">
          <div className="tab-time-col"><button onClick={() => setReveilH((h) => (h + 1) % 24)}>+</button><small>{t.hour}</small><button onClick={() => setReveilH((h) => (h + 23) % 24)}>−</button></div>
          <div className="tab-time-col"><button onClick={() => setReveilM((m) => (m + 5) % 60)}>+</button><small>{t.minutes}</small><button onClick={() => setReveilM((m) => (m + 55) % 60)}>−</button></div>
        </div>
        <button className="tab-btn" onClick={() => applyReveil(`${String(reveilH).padStart(2, "0")}:${String(reveilM).padStart(2, "0")}`)}>{activeReveil ? t.updateTheAlarm : t.setTheAlarm}</button>
        {activeReveil && <button className="tab-btn outline" style={{ marginTop: "3cqw" }} onClick={cancelReveil}>{t.cancelAlarm}</button>}
      </>);

      case "lateCheckout": return wrap(t.lateCheckout, <>
        <div className="tab-recap-card"><div><span>{t.scheduledDeparture}</span><b>12h00</b></div><div><span>{t.newDeparture}</span><b>14h00</b></div><div><span>{t.surcharge}</span><b>+40 {currency}</b></div><div><span>{t.billing}</span><b>{t.stayBill}</b></div></div>
        <button className="tab-btn" disabled={lateCheckoutOrdered} onClick={() => { addToCart({ id: "late-checkout", nom: "Late check-out 14h00", prix: 40, emoji: "🧳" }, 1, null, "reception"); showPopup("✓", t.addedConfirmInOrder); }}>{lateCheckoutOrdered ? t.alreadyRequestedShort : t.addToStayBill}</button>
      </>);

      case "evaluation": return wrap(t.rateMyStay, evalSent ? <div className="tab-confirmed"><div className="tab-check">✓</div><p className="tab-p">{t.thanksForReview}</p></div> : <>
        <div className="tab-stars">{[1, 2, 3, 4, 5].map((n) => <button key={n} className={n <= evalStars ? "active" : ""} onClick={() => setEvalStars(n)}>★</button>)}</div>
        <div className="tab-pills">{t.evalTags.map((tag) => <span key={tag} className={`tab-pill select${evalTags.includes(tag) ? " active" : ""}`} onClick={() => setEvalTags((tg) => tg.includes(tag) ? tg.filter((x) => x !== tag) : [...tg, tag])}>{tag}</span>)}</div>
        <textarea className="tab-textarea" placeholder={t.commentPlaceholder} value={evalComment} onChange={(e) => setEvalComment(e.target.value)} />
        <button className="tab-btn" disabled={evalStars === 0} onClick={() => setEvalSent(true)}>{t.sendMyReview}</button>
      </>);
    }
  })();

  return <div className="tab-shell"><div className="tab-canvas"><div className="tab-card">
    {screen !== "veille" && <time className="tab-time">{clock}</time>}
    {content}
    {popup && <div className="tab-popup-overlay"><div className="tab-popup"><div className="tab-popup-icon">{popup.icon}</div><p>{popup.text}</p></div></div>}
  </div></div></div>;
}
