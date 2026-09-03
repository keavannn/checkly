"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type ScreenId =
  | "welcome" | "languages" | "arrival" | "reservation" | "scan"
  | "confirmation" | "upgrade" | "services" | "basket" | "recap"
  | "tax" | "payment" | "paymentLoading" | "paymentAccepted" | "print"
  | "keys" | "final" | "departure" | "late" | "taxi" | "time"
  | "cash" | "paymentRefused" | "backOffice";

const cardServices = [
  ["Petit déjeuner", "+35 CHF / nuit", "☕"], ["Accès spa", "+50 CHF / nuit", "✦"],
  ["Champagne en chambre", "+80 CHF", "⌇"], ["Lit bébé", "GRATUIT", "⌂"],
  ["Late check-out 14h", "+40 CHF", "◷"], ["Parking", "+30 CHF / nuit", "▣"],
  ["Transfert aéroport retour", "+90 CHF / nuit", "↗"],
];

function today() { return "14:32 - Lun 22 Juin"; }

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

function Frame({ children, onBack, canGoBack }: { children: React.ReactNode; onBack: () => void; canGoBack: boolean }) {
  return <div className="canvas-shell">
    <div className="figma-canvas">
      <div className="figma-card" />
      <time className="figma-date">{today()}</time>
      {canGoBack && <motion.button className="back-arrow" aria-label="Retour à l'écran précédent" onClick={onBack} whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}>←</motion.button>}
      {children}
    </div>
  </div>;
}

export default function Kiosk() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [services, setServices] = useState<string[]>(["Petit déjeuner", "Champagne en chambre"]);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [taxiTime, setTaxiTime] = useState("10:30");
  const [reservation, setReservation] = useState("");
  const go = (id: ScreenId) => {
    setHistory((current) => [...current, screen]);
    setScreen(id);
  };
  const goBack = () => {
    if (history.length === 0) return;
    setScreen(history[history.length - 1]);
    setHistory((current) => current.slice(0, -1));
  };
  const toggleService = (name: string) => setServices((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  const basketItems = selectedUpgrade ? [selectedUpgrade, ...services] : services;
  const itemPrice = (item: string) => item === "Suite Junior" ? 267 : item === "Suite Prestige" ? 567 : item === "Suite Royale" ? 960 : item === "Petit déjeuner" ? 70 : item === "Champagne en chambre" ? 80 : 40;
  const removeBasketItem = (item: string) => item === selectedUpgrade ? setSelectedUpgrade(null) : toggleService(item);
  const total = useMemo(() => 1180 + basketItems.reduce((sum, item) => sum + itemPrice(item), 0), [basketItems]);

  useEffect(() => {
    const handleArrow = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", handleArrow);
    return () => window.removeEventListener("keydown", handleArrow);
  }, [goBack]);

  const content = (() => {
    switch (screen) {
      case "welcome": return <Frame onBack={goBack} canGoBack={history.length > 0}><button className="welcome-screen" onClick={() => go("languages")}>
        <div className="welcome-content"><p>Royal Savoy</p><strong>CHECKLY</strong><span>LAUSANNE · SWITZERLAND</span><h1>Bienvenue</h1><small>Appuyez pour commencer</small><motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="tap-icon"><img src="/figma/welcome-tap.svg" alt=""/><img src="/figma/welcome-hand.svg" alt="Touchez pour commencer"/></motion.span></div>
      </button></Frame>;
      case "languages": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="language-screen"><Heading title="Sélectionnez votre langue" brand={false}/><div className="language-cards">{["Français", "English", "Español", "Deutsch", "Italiano", "العربية"].map((language, index) => <button key={language} className={index === 0 ? "active" : ""} onClick={() => go("arrival")}>{language}</button>)}</div></section></Frame>;
      case "arrival": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="arrival-screen"><Brand/><p className="location">Lausanne - Switzerland</p><i className="title-line"/><p className="prompt">Comment puis-je vous aider ?</p><div className="arrival-cards"><button className="check-in" onClick={() => go("reservation")}><h2>Check-in</h2><p>J’arrive et je souhaite<br/>accéder à ma chambre</p><span>Commencer</span></button><b>OU</b><button className="check-out" onClick={() => go("departure")}><h2>Check-out</h2><p>Je pars et je souhaite<br/>préparer mon départ</p><span>Commencer</span></button></div></section></Frame>;
      case "reservation": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="reservation-screen"><Heading title="Retrouvez votre réservation" intro="Entrez votre nom de famille ou scannez votre QR code."/><div className="lookup-grid"><div className="lookup-card"><label>Nom de famille<input value={reservation} onChange={(event) => setReservation(event.target.value)} placeholder="DUBOIS"/></label><Button onClick={() => go("confirmation")}>Continuer</Button></div><b>OU</b><button className="qr-card" onClick={() => go("scan")}><span>⌗</span><strong>Scanner mon QR code</strong><small>Présentez le code reçu par e-mail</small></button></div></section></Frame>;
      case "scan": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="scan-screen"><Heading title="Scannez votre QR code" intro="Positionnez le QR code face au lecteur de la borne."/><div className="scanner"><div className="scan-laser"/><span>⌗</span></div><p>Lecture automatique en cours…</p><Button onClick={() => go("confirmation")}>J&apos;ai scanné mon code</Button></section></Frame>;
      case "confirmation": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="confirmation-screen"><span className="success-mark">✓</span><Heading title="Bonjour, Keavan" intro="22 juin - 25 juin • 3 nuits" brand={false}/><div className="confirmation-card"><div><small>CHAMBRE</small><strong>Deluxe Lake View</strong><p>Étage 4 · Vue lac</p></div><div><small>ARRIVÉE</small><strong>À partir de 15:00</strong><p>Votre chambre est prête</p></div><div><small>VOTRE CLÉ</small><strong>{cardCount ? `${cardCount} cartes` : "À sélectionner"}</strong><p>Retirez-les à la borne</p></div></div><p className="count-question">Combien de cartes souhaitez-vous ?</p><div className="number-pills">{[1,2,3,4].map((number) => <button className={cardCount === number ? "selected" : ""} onClick={() => setCardCount(number)} key={number}>{number}</button>)}</div><Button className="confirmation-continue" disabled={!cardCount} onClick={() => go("upgrade")}>Continuer</Button><button className="mail-choice" onClick={() => go("upgrade")}>✉&nbsp; Recevoir ma clé digitale par email</button></section></Frame>;
      case "upgrade": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="upgrade-screen"><Heading title="Améliorez votre séjour" intro="Des suites sont disponibles pour votre séjour du 22 au 25 juin."/><div className="suite-grid">{[["Suite Junior", "Vue lac · 45m² · Balcon", "+89 CHF / nuit"],["Suite Prestige", "Vue lac · 80m² · Terrasse", "+189 CHF / nuit"],["Suite Royale", "Vue panoramique · 120m²", "+320 CHF / nuit"]].map(([name, detail, price], index) => <article key={name} className={index === 0 ? "popular" : ""}><div className="suite-image">{index === 0 && <span>POPULAIRE</span>}</div><h2>{name}</h2><p>{detail}</p><strong>{price}</strong><motion.button className={`figma-button filled ${selectedUpgrade === name ? "added" : ""}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} animate={selectedUpgrade === name ? { scale: [1, 1.08, 1] } : { scale: 1 }} transition={{ duration: .32 }} onClick={() => setSelectedUpgrade(name)}>{selectedUpgrade === name ? "Ajouté ✓" : "Upgrader"}</motion.button></article>)}</div><button className="skip-link" onClick={() => go("services")}>Non merci, je garde ma chambre actuelle →</button><Button className="upgrade-continue" onClick={() => go("services")}>Continuer</Button><button className="upgrade-cart" aria-label={`Ouvrir le panier, ${basketItems.length} article${basketItems.length > 1 ? "s" : ""}`} onClick={() => go("basket")}><CartIcon/><span>{basketItems.length}</span></button></section></Frame>;
      case "services": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="services-screen"><Heading title="Personnalisez votre séjour" intro="Ajoutez des services en un clic avant d’accéder à votre chambre."/><div className="service-grid">{cardServices.slice(0, 6).map(([name, price, icon]) => <button key={name} className={services.includes(name) ? "chosen" : ""} onClick={() => toggleService(name)}><span>{icon}</span><strong>{name}</strong><small>{price}</small><i>{services.includes(name) ? "Ajouté ✓" : "Ajouter +"}</i></button>)}</div><Button onClick={() => go("basket")}>Voir mon panier</Button></section></Frame>;
      case "basket": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="basket-screen"><Heading title="Votre panier" intro="Vérifiez les services ajoutés à votre séjour."/><div className="basket-list">{basketItems.length === 0 ? <p>Aucun service sélectionné.</p> : basketItems.map((item) => <div key={item}><span>{item}</span><strong>{itemPrice(item)} CHF</strong><button onClick={() => removeBasketItem(item)}>Retirer</button></div>)}</div><div className="basket-total"><span>Total séjour</span><strong>CHF {total}.00</strong></div><Button onClick={() => go("recap")}>Continuer</Button></section></Frame>;
      case "recap": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="recap-screen"><Heading title="Votre séjour" intro="Tout est prêt pour votre arrivée au Royal Savoy."/><div className="recap-grid"><article><span>⌂</span><h2>Chambre</h2><p>Deluxe Lake View<br/>Étage 4</p></article><article><span>▣</span><h2>Parking</h2><p>Place réservée<br/>Accès dès 14:00</p></article><article><span>⌁</span><h2>Services</h2><p>{basketItems.length} service(s)<br/>confirmé(s)</p></article><article><span>⌁</span><h2>Wi‑Fi</h2><p>RoyalSavoy-Guest<br/>Connexion offerte</p></article></div><div className="map-card"><strong>Votre chambre est prête.</strong><p>Récupérez vos cartes ci-dessous · Réception disponible 24h/24.</p></div><Button onClick={() => go("tax")}>Procéder au paiement</Button></section></Frame>;
      case "tax": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="tax-screen"><Heading title="Taxe de séjour" intro="La taxe de séjour est obligatoire pour chaque nuit passée à Lausanne."/><div className="tax-card"><div><small>3 NUITS · 2 ADULTES</small><strong>Taxe de séjour</strong><p>CHF 3.50 par personne et par nuit</p></div><b>CHF 21.00</b></div><Button onClick={() => go("payment")}>Accepter et continuer</Button></section></Frame>;
      case "payment": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="payment-screen"><Heading title="Paiement" intro="Choisissez votre moyen de règlement."/><div className="payment-choices"><button onClick={() => go("paymentLoading")}><span>▣</span><strong>Carte bancaire</strong><small>Sans contact, puce ou code PIN</small></button><button onClick={() => go("cash")}><span>₣</span><strong>Espèces</strong><small>Paiement auprès de la réception</small></button></div><p className="amount">Montant à régler <strong>CHF {total + 21}.00</strong></p></section></Frame>;
      case "paymentLoading": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="machine-screen"><Heading title="Présentez votre carte" intro="Approchez ou insérez votre carte bancaire dans le terminal."/><motion.div className="terminal-device" animate={{ opacity: [1,.55,1] }} transition={{ repeat: Infinity, duration: 1.3 }}><span>◒</span><p>Terminal prêt</p></motion.div><Button onClick={() => go("paymentAccepted")}>Paiement effectué</Button><button className="minor-link" onClick={() => go("paymentRefused")}>Simuler un refus</button></section></Frame>;
      case "paymentAccepted": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="result-screen"><span className="success-mark large">✓</span><Heading title="Paiement accepté" intro={`CHF ${total + 21}.00 ont été réglés avec succès.`} brand={false}/><Button onClick={() => go("print")}>Imprimer mes cartes</Button></section></Frame>;
      case "paymentRefused": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="result-screen"><span className="error-mark">!</span><Heading title="Paiement refusé" intro="Votre carte n’a pas pu être débitée. Veuillez essayer une autre carte ou choisir les espèces." brand={false}/><Button onClick={() => go("payment")}>Réessayer</Button></section></Frame>;
      case "cash": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="cash-screen"><Heading title="Paiement en espèces" intro="Présentez-vous à la réception avec cette référence pour régler votre séjour."/><div className="reference">CHEEKLY-0622<br/><small>CHF {total + 21}.00</small></div><Button onClick={() => go("print")}>Paiement validé par la réception</Button></section></Frame>;
      case "print": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="machine-screen"><Heading title="Préparation de vos cartes" intro={`${cardCount ?? 1} carte(s) sont en cours d’impression. Retirez-les lorsqu’elles apparaissent.`}/><motion.div className="printer" animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.3 }}><i/><i/><i/></motion.div><Button onClick={() => go("keys")}>Mes cartes sont prêtes</Button></section></Frame>;
      case "keys": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="keys-screen"><Heading title="Vos cartes sont prêtes" intro="Retirez-les maintenant dans le compartiment éclairé."/><div className="key-stack">{Array.from({ length: cardCount ?? 1 }).map((_, index) => <div key={index}><small>ROYAL SAVOY</small><strong>416</strong><span>DELUXE LAKE VIEW</span></div>)}</div><Button onClick={() => go("final")}>J&apos;ai récupéré mes cartes</Button></section></Frame>;
      case "final": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="result-screen"><span className="success-mark large">✓</span><Heading title="Bienvenue au Royal Savoy" intro="Votre check-in est terminé. Nous vous souhaitons un merveilleux séjour à Lausanne." brand={false}/><Button onClick={() => go("welcome")}>Terminer</Button></section></Frame>;
      case "departure": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="departure-screen"><Heading title="Préparez votre départ" intro="Comment pouvons-nous faciliter votre check-out ?"/><div className="departure-grid"><button onClick={() => go("late")}><span>◷</span><strong>Late check-out</strong><small>Gardez votre chambre jusqu’à 14:00</small></button><button onClick={() => go("taxi")}><span>▰</span><strong>Commander un taxi</strong><small>Planifiez votre transfert vers l’aéroport</small></button></div><Button onClick={() => go("payment")}>Finaliser mon check-out</Button></section></Frame>;
      case "late": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="late-screen"><Heading title="Late check-out" intro="Profitez de votre chambre jusqu’à 14:00."/><div className="late-price"><strong>CHF 40.00</strong><span>supplément unique</span></div><Button onClick={() => go("payment")}>Ajouter à mon séjour</Button><button className="minor-link" onClick={() => go("departure")}>Non merci</button></section></Frame>;
      case "taxi": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="taxi-screen"><Heading title="Commander un taxi" intro="Choisissez votre destination et l’heure de départ."/><div className="taxi-info"><label>Destination<select><option>Aéroport de Genève</option><option>Gare de Lausanne</option><option>Centre-ville</option></select></label><label>Heure de départ<button onClick={() => go("time")}>{taxiTime} · Modifier</button></label></div><Button onClick={() => go("payment")}>Réserver ce taxi</Button></section></Frame>;
      case "time": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="time-screen"><Heading title="Choisissez votre heure" intro="Sélectionnez l’heure souhaitée pour votre taxi."/><div className="time-display">{taxiTime}</div><div className="time-grid">{["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"].map((value) => <button className={taxiTime === value ? "selected" : ""} onClick={() => setTaxiTime(value)} key={value}>{value}</button>)}</div><Button onClick={() => go("taxi")}>Confirmer l’heure</Button></section></Frame>;
      case "backOffice": return <Frame onBack={goBack} canGoBack={history.length > 0}><section className="backoffice-screen"><Heading title="Back Office" intro="Tableau de bord de la borne Checkly."/><div className="backoffice-grid"><article><small>CHECK-INS AUJOURD’HUI</small><strong>42</strong></article><article><small>CARTES IMPRIMÉES</small><strong>76</strong></article><article><small>PAIEMENTS EN ATTENTE</small><strong>3</strong></article><article><small>ASSISTANCE</small><strong>24/7</strong></article></div><Button onClick={() => go("welcome")}>Retour à la borne</Button></section></Frame>;
    }
  })();

  return <main className="kiosk"> <AnimatePresence mode="wait"><motion.div key={screen} initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.015 }} transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}>{content}</motion.div></AnimatePresence></main>;
}
