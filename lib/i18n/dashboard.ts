import type { Lang } from "./index";
import { restaurationSections, boissonSections, produitSections, menuItemName } from "./../menu";
import { stayServices, suiteOptions, taxeSejour, serviceName } from "./../services";
import { translateServiceLabel } from "./serviceLabels";

export type DashCopy = {
  locale: string;
  languageLabel: string;
  brand: string;
  connected: string;
  tabKitchen: string; tabReception: string; tabRooms: string; tabChat: string;
  counterPending: string; counterPreparing: string; counterDelivered: string;
  colNew: string; colPreparing: string; colReady: string;
  emptyNew: string; emptyPreparing: string; emptyReady: string;
  room: (n: number) => string;
  roomAbbr: string;
  acceptPrepare: string; readyToDeliver: string; inDeliveryWaiting: string; deliveredBadge: string;
  handledBadge: string; markHandled: string;
  timeAgo: (time: string, mins: number) => string;
  total: string; stayTotal: string; dayTotal: string; free: string;
  activeCount: (n: number) => string;
  ordersItems: (orders: number, items: number) => string;
  lateCheckoutTag: string; collapse: string; seeDetail: string;
  arrivalsStays: string; pmsDown: string; noArrivals: string;
  resaStatus: { attendu: string; arrive: string; parti: string };
  relDay: (diff: number, time: string) => string;
  toHandle: string; noRequest: string; otherNotifs: string; noNotif: string;
  occupiedRooms: string; noActiveRoom: string;
  detailedStats: string; catKitchen: string; catHousekeeping: string;
  periodDay: string; periodWeek: string; periodMonth: string; simulateActivity: string;
  orders: string; requests: string; revenue: string; distinctItems: string; requestTypes: string;
  revenueTrend: string; everythingOrdered: string; mostRequested: string; noOrdersPeriod: string; noRequestsPeriod: string;
  conversations: string; simulateChats: string; noConversation: string; you: string; pickConversation: string;
  quickReplies: string[]; replyPlaceholder: string; send: string; guestFallback: string;
  historyToday: string; noDeliveredToday: string;
  todayStats: string; totalOrders: string; avgTime: string; minShort: (n: number) => string; topDish: string;
  seeAllStats: string; lastDelivered: string; noDelivered: string; seeAllHistory: string;
};

const fr: DashCopy = {
  locale: "fr-FR",
  languageLabel: "Langue",
  brand: "CHECKLY · Dashboard Cuisine",
  connected: "Connecté",
  tabKitchen: "Cuisine", tabReception: "Réception", tabRooms: "Chambres", tabChat: "Chat",
  counterPending: "En attente", counterPreparing: "En préparation", counterDelivered: "Livrées",
  colNew: "Nouvelles", colPreparing: "En préparation", colReady: "Prêtes / Livrées",
  emptyNew: "Aucune nouvelle commande", emptyPreparing: "Rien en préparation", emptyReady: "Rien à livrer",
  room: (n) => `Chambre ${n}`,
  roomAbbr: "Ch.",
  acceptPrepare: "✓ Accepter & Préparer", readyToDeliver: "→ Prêt à livrer", inDeliveryWaiting: "En livraison · en attente du client", deliveredBadge: "Livré ✓",
  handledBadge: "Traité ✓", markHandled: "✓ Marquer comme traité",
  timeAgo: (time, mins) => `${time} — il y a ${mins} min`,
  total: "Total", stayTotal: "Total séjour", dayTotal: "Total du jour", free: "Gratuit",
  activeCount: (n) => `${n} en cours`,
  ordersItems: (o, i) => `${o} commande${o > 1 ? "s" : ""} · ${i} article${i > 1 ? "s" : ""}`,
  lateCheckoutTag: "Late check-out", collapse: "Réduire ↑", seeDetail: "Voir le détail →",
  arrivalsStays: "Arrivées & séjours", pmsDown: "Connexion au système hôtelier impossible", noArrivals: "Aucune arrivée sur les prochains jours",
  resaStatus: { attendu: "Attendu", arrive: "Arrivé", parti: "Parti" },
  relDay: (d, time) => d === 0 ? `Aujourd'hui · ${time}` : d === 1 ? `Demain · ${time}` : d === -1 ? `Hier · ${time}` : d > 1 ? `Dans ${d} jours · ${time}` : `Il y a ${Math.abs(d)} jours`,
  toHandle: "Demandes à traiter", noRequest: "Aucune demande", otherNotifs: "Autres notifications", noNotif: "Aucune notification",
  occupiedRooms: "Chambres occupées", noActiveRoom: "Aucune chambre active",
  detailedStats: "Statistiques détaillées", catKitchen: "🍽️ Cuisine", catHousekeeping: "🧹 Ménage & services",
  periodDay: "Jour", periodWeek: "Semaine", periodMonth: "Mois", simulateActivity: "🎲 Simuler de l'activité",
  orders: "Commandes", requests: "Demandes", revenue: "Chiffre d'affaires", distinctItems: "Articles distincts", requestTypes: "Types de demandes",
  revenueTrend: "Évolution du chiffre d'affaires", everythingOrdered: "Tout ce qui a été commandé", mostRequested: "Ce que les clients demandent le plus",
  noOrdersPeriod: "Aucune commande sur cette période", noRequestsPeriod: "Aucune demande sur cette période",
  conversations: "Conversations", simulateChats: "🎲 Simuler des chats", noConversation: "Aucune conversation", you: "Vous : ", pickConversation: "Sélectionnez une conversation",
  quickReplies: [
    "Bien sûr, nous nous en occupons tout de suite.",
    "Un instant, je reviens vers vous très vite.",
    "Nous envoyons quelqu'un dans votre chambre immédiatement.",
    "Toutes nos excuses pour la gêne occasionnée.",
    "Le petit-déjeuner est servi jusqu'à 10h30 en salle.",
    "Le spa est ouvert de 9h à 20h, sur réservation.",
    "C'est noté, merci de votre message.",
    "N'hésitez pas si vous avez besoin d'autre chose 🙏",
  ],
  replyPlaceholder: "Répondre...", send: "Envoyer", guestFallback: "Client",
  historyToday: "Historique du jour", noDeliveredToday: "Aucune commande livrée aujourd'hui",
  todayStats: "Statistiques du jour", totalOrders: "Total commandes", avgTime: "Temps moyen", minShort: (n) => `${n} min`, topDish: "Plat le plus commandé",
  seeAllStats: "Voir toutes les statistiques →", lastDelivered: "Dernières livrées", noDelivered: "Aucune commande livrée", seeAllHistory: "Voir tout l'historique →",
};

const en: DashCopy = {
  locale: "en-GB",
  languageLabel: "Language",
  brand: "CHECKLY · Kitchen Dashboard",
  connected: "Connected",
  tabKitchen: "Kitchen", tabReception: "Reception", tabRooms: "Rooms", tabChat: "Chat",
  counterPending: "Pending", counterPreparing: "Preparing", counterDelivered: "Delivered",
  colNew: "New", colPreparing: "Preparing", colReady: "Ready / Delivered",
  emptyNew: "No new orders", emptyPreparing: "Nothing being prepared", emptyReady: "Nothing to deliver",
  room: (n) => `Room ${n}`,
  roomAbbr: "Rm.",
  acceptPrepare: "✓ Accept & Prepare", readyToDeliver: "→ Ready to deliver", inDeliveryWaiting: "Out for delivery · waiting for the guest", deliveredBadge: "Delivered ✓",
  handledBadge: "Handled ✓", markHandled: "✓ Mark as handled",
  timeAgo: (time, mins) => `${time} — ${mins} min ago`,
  total: "Total", stayTotal: "Stay total", dayTotal: "Today's total", free: "Free",
  activeCount: (n) => `${n} active`,
  ordersItems: (o, i) => `${o} order${o > 1 ? "s" : ""} · ${i} item${i > 1 ? "s" : ""}`,
  lateCheckoutTag: "Late check-out", collapse: "Collapse ↑", seeDetail: "View details →",
  arrivalsStays: "Arrivals & stays", pmsDown: "Unable to connect to the hotel system", noArrivals: "No arrivals in the coming days",
  resaStatus: { attendu: "Expected", arrive: "Arrived", parti: "Departed" },
  relDay: (d, time) => d === 0 ? `Today · ${time}` : d === 1 ? `Tomorrow · ${time}` : d === -1 ? `Yesterday · ${time}` : d > 1 ? `In ${d} days · ${time}` : `${Math.abs(d)} days ago`,
  toHandle: "Requests to handle", noRequest: "No requests", otherNotifs: "Other notifications", noNotif: "No notifications",
  occupiedRooms: "Occupied rooms", noActiveRoom: "No active rooms",
  detailedStats: "Detailed statistics", catKitchen: "🍽️ Kitchen", catHousekeeping: "🧹 Housekeeping & services",
  periodDay: "Day", periodWeek: "Week", periodMonth: "Month", simulateActivity: "🎲 Simulate activity",
  orders: "Orders", requests: "Requests", revenue: "Revenue", distinctItems: "Distinct items", requestTypes: "Request types",
  revenueTrend: "Revenue trend", everythingOrdered: "Everything that was ordered", mostRequested: "What guests request most",
  noOrdersPeriod: "No orders in this period", noRequestsPeriod: "No requests in this period",
  conversations: "Conversations", simulateChats: "🎲 Simulate chats", noConversation: "No conversations", you: "You: ", pickConversation: "Select a conversation",
  quickReplies: [
    "Of course, we will take care of it right away.",
    "One moment, I will get back to you very shortly.",
    "We are sending someone to your room immediately.",
    "Our sincere apologies for the inconvenience.",
    "Breakfast is served until 10:30 AM in the dining room.",
    "The spa is open from 9 AM to 8 PM, by reservation.",
    "Noted, thank you for your message.",
    "Don't hesitate if you need anything else 🙏",
  ],
  replyPlaceholder: "Reply...", send: "Send", guestFallback: "Guest",
  historyToday: "Today's history", noDeliveredToday: "No orders delivered today",
  todayStats: "Today's statistics", totalOrders: "Total orders", avgTime: "Average time", minShort: (n) => `${n} min`, topDish: "Most ordered dish",
  seeAllStats: "See all statistics →", lastDelivered: "Latest deliveries", noDelivered: "No orders delivered", seeAllHistory: "See full history →",
};

const es: DashCopy = {
  locale: "es-ES",
  languageLabel: "Idioma",
  brand: "CHECKLY · Panel de cocina",
  connected: "Conectado",
  tabKitchen: "Cocina", tabReception: "Recepción", tabRooms: "Habitaciones", tabChat: "Chat",
  counterPending: "Pendientes", counterPreparing: "En preparación", counterDelivered: "Entregados",
  colNew: "Nuevos", colPreparing: "En preparación", colReady: "Listos / Entregados",
  emptyNew: "Ningún pedido nuevo", emptyPreparing: "Nada en preparación", emptyReady: "Nada que entregar",
  room: (n) => `Habitación ${n}`,
  roomAbbr: "Hab.",
  acceptPrepare: "✓ Aceptar y preparar", readyToDeliver: "→ Listo para entregar", inDeliveryWaiting: "En entrega · esperando al cliente", deliveredBadge: "Entregado ✓",
  handledBadge: "Atendido ✓", markHandled: "✓ Marcar como atendido",
  timeAgo: (time, mins) => `${time} — hace ${mins} min`,
  total: "Total", stayTotal: "Total de la estancia", dayTotal: "Total del día", free: "Gratis",
  activeCount: (n) => `${n} en curso`,
  ordersItems: (o, i) => `${o} pedido${o > 1 ? "s" : ""} · ${i} artículo${i > 1 ? "s" : ""}`,
  lateCheckoutTag: "Salida tardía", collapse: "Reducir ↑", seeDetail: "Ver detalle →",
  arrivalsStays: "Llegadas y estancias", pmsDown: "No se puede conectar con el sistema del hotel", noArrivals: "Ninguna llegada en los próximos días",
  resaStatus: { attendu: "Esperado", arrive: "Llegado", parti: "Salido" },
  relDay: (d, time) => d === 0 ? `Hoy · ${time}` : d === 1 ? `Mañana · ${time}` : d === -1 ? `Ayer · ${time}` : d > 1 ? `En ${d} días · ${time}` : `Hace ${Math.abs(d)} días`,
  toHandle: "Solicitudes por atender", noRequest: "Ninguna solicitud", otherNotifs: "Otras notificaciones", noNotif: "Ninguna notificación",
  occupiedRooms: "Habitaciones ocupadas", noActiveRoom: "Ninguna habitación activa",
  detailedStats: "Estadísticas detalladas", catKitchen: "🍽️ Cocina", catHousekeeping: "🧹 Limpieza y servicios",
  periodDay: "Día", periodWeek: "Semana", periodMonth: "Mes", simulateActivity: "🎲 Simular actividad",
  orders: "Pedidos", requests: "Solicitudes", revenue: "Ingresos", distinctItems: "Artículos distintos", requestTypes: "Tipos de solicitud",
  revenueTrend: "Evolución de los ingresos", everythingOrdered: "Todo lo que se ha pedido", mostRequested: "Lo que más piden los clientes",
  noOrdersPeriod: "Ningún pedido en este periodo", noRequestsPeriod: "Ninguna solicitud en este periodo",
  conversations: "Conversaciones", simulateChats: "🎲 Simular chats", noConversation: "Ninguna conversación", you: "Usted: ", pickConversation: "Seleccione una conversación",
  quickReplies: [
    "Por supuesto, nos ocupamos de ello enseguida.",
    "Un momento, vuelvo con usted enseguida.",
    "Enviamos a alguien a su habitación de inmediato.",
    "Disculpe las molestias ocasionadas.",
    "El desayuno se sirve hasta las 10:30 en el comedor.",
    "El spa abre de 9:00 a 20:00, con reserva previa.",
    "Anotado, gracias por su mensaje.",
    "No dude en pedirnos cualquier otra cosa 🙏",
  ],
  replyPlaceholder: "Responder...", send: "Enviar", guestFallback: "Cliente",
  historyToday: "Historial del día", noDeliveredToday: "Ningún pedido entregado hoy",
  todayStats: "Estadísticas del día", totalOrders: "Total de pedidos", avgTime: "Tiempo medio", minShort: (n) => `${n} min`, topDish: "Plato más pedido",
  seeAllStats: "Ver todas las estadísticas →", lastDelivered: "Últimas entregas", noDelivered: "Ningún pedido entregado", seeAllHistory: "Ver todo el historial →",
};

const de: DashCopy = {
  locale: "de-DE",
  languageLabel: "Sprache",
  brand: "CHECKLY · Küchen-Dashboard",
  connected: "Verbunden",
  tabKitchen: "Küche", tabReception: "Rezeption", tabRooms: "Zimmer", tabChat: "Chat",
  counterPending: "Offen", counterPreparing: "In Zubereitung", counterDelivered: "Geliefert",
  colNew: "Neu", colPreparing: "In Zubereitung", colReady: "Fertig / Geliefert",
  emptyNew: "Keine neuen Bestellungen", emptyPreparing: "Nichts in Zubereitung", emptyReady: "Nichts zu liefern",
  room: (n) => `Zimmer ${n}`,
  roomAbbr: "Zi.",
  acceptPrepare: "✓ Annehmen & Zubereiten", readyToDeliver: "→ Bereit zur Lieferung", inDeliveryWaiting: "In Lieferung · wartet auf den Gast", deliveredBadge: "Geliefert ✓",
  handledBadge: "Erledigt ✓", markHandled: "✓ Als erledigt markieren",
  timeAgo: (time, mins) => `${time} — vor ${mins} Min.`,
  total: "Gesamt", stayTotal: "Aufenthalt gesamt", dayTotal: "Tagesgesamt", free: "Kostenlos",
  activeCount: (n) => `${n} aktiv`,
  ordersItems: (o, i) => `${o} Bestellung${o > 1 ? "en" : ""} · ${i} Artikel`,
  lateCheckoutTag: "Später Check-out", collapse: "Einklappen ↑", seeDetail: "Details ansehen →",
  arrivalsStays: "Anreisen & Aufenthalte", pmsDown: "Verbindung zum Hotelsystem nicht möglich", noArrivals: "Keine Anreisen in den nächsten Tagen",
  resaStatus: { attendu: "Erwartet", arrive: "Angekommen", parti: "Abgereist" },
  relDay: (d, time) => d === 0 ? `Heute · ${time}` : d === 1 ? `Morgen · ${time}` : d === -1 ? `Gestern · ${time}` : d > 1 ? `In ${d} Tagen · ${time}` : `Vor ${Math.abs(d)} Tagen`,
  toHandle: "Offene Anfragen", noRequest: "Keine Anfragen", otherNotifs: "Weitere Benachrichtigungen", noNotif: "Keine Benachrichtigungen",
  occupiedRooms: "Belegte Zimmer", noActiveRoom: "Keine aktiven Zimmer",
  detailedStats: "Detaillierte Statistiken", catKitchen: "🍽️ Küche", catHousekeeping: "🧹 Housekeeping & Services",
  periodDay: "Tag", periodWeek: "Woche", periodMonth: "Monat", simulateActivity: "🎲 Aktivität simulieren",
  orders: "Bestellungen", requests: "Anfragen", revenue: "Umsatz", distinctItems: "Verschiedene Artikel", requestTypes: "Anfragearten",
  revenueTrend: "Umsatzentwicklung", everythingOrdered: "Alles, was bestellt wurde", mostRequested: "Was Gäste am häufigsten anfragen",
  noOrdersPeriod: "Keine Bestellungen in diesem Zeitraum", noRequestsPeriod: "Keine Anfragen in diesem Zeitraum",
  conversations: "Unterhaltungen", simulateChats: "🎲 Chats simulieren", noConversation: "Keine Unterhaltungen", you: "Sie: ", pickConversation: "Wählen Sie eine Unterhaltung",
  quickReplies: [
    "Selbstverständlich, wir kümmern uns sofort darum.",
    "Einen Moment bitte, ich melde mich gleich bei Ihnen.",
    "Wir schicken sofort jemanden auf Ihr Zimmer.",
    "Wir entschuldigen uns für die Unannehmlichkeiten.",
    "Das Frühstück wird bis 10:30 Uhr im Speisesaal serviert.",
    "Das Spa ist von 9 bis 20 Uhr geöffnet, nur mit Reservierung.",
    "Notiert, vielen Dank für Ihre Nachricht.",
    "Melden Sie sich gerne, wenn Sie noch etwas benötigen 🙏",
  ],
  replyPlaceholder: "Antworten...", send: "Senden", guestFallback: "Gast",
  historyToday: "Verlauf des Tages", noDeliveredToday: "Heute keine Bestellungen geliefert",
  todayStats: "Statistiken des Tages", totalOrders: "Bestellungen gesamt", avgTime: "Durchschnittszeit", minShort: (n) => `${n} Min.`, topDish: "Meistbestelltes Gericht",
  seeAllStats: "Alle Statistiken ansehen →", lastDelivered: "Zuletzt geliefert", noDelivered: "Keine Bestellung geliefert", seeAllHistory: "Gesamten Verlauf ansehen →",
};

const it: DashCopy = {
  locale: "it-IT",
  languageLabel: "Lingua",
  brand: "CHECKLY · Dashboard cucina",
  connected: "Connesso",
  tabKitchen: "Cucina", tabReception: "Reception", tabRooms: "Camere", tabChat: "Chat",
  counterPending: "In attesa", counterPreparing: "In preparazione", counterDelivered: "Consegnati",
  colNew: "Nuovi", colPreparing: "In preparazione", colReady: "Pronti / Consegnati",
  emptyNew: "Nessun nuovo ordine", emptyPreparing: "Niente in preparazione", emptyReady: "Niente da consegnare",
  room: (n) => `Camera ${n}`,
  roomAbbr: "Cam.",
  acceptPrepare: "✓ Accetta e prepara", readyToDeliver: "→ Pronto per la consegna", inDeliveryWaiting: "In consegna · in attesa del cliente", deliveredBadge: "Consegnato ✓",
  handledBadge: "Gestito ✓", markHandled: "✓ Segna come gestito",
  timeAgo: (time, mins) => `${time} — ${mins} min fa`,
  total: "Totale", stayTotal: "Totale soggiorno", dayTotal: "Totale del giorno", free: "Gratuito",
  activeCount: (n) => `${n} in corso`,
  ordersItems: (o, i) => `${o} ordin${o > 1 ? "i" : "e"} · ${i} articol${i > 1 ? "i" : "o"}`,
  lateCheckoutTag: "Late check-out", collapse: "Riduci ↑", seeDetail: "Vedi dettaglio →",
  arrivalsStays: "Arrivi e soggiorni", pmsDown: "Impossibile connettersi al sistema alberghiero", noArrivals: "Nessun arrivo nei prossimi giorni",
  resaStatus: { attendu: "Atteso", arrive: "Arrivato", parti: "Partito" },
  relDay: (d, time) => d === 0 ? `Oggi · ${time}` : d === 1 ? `Domani · ${time}` : d === -1 ? `Ieri · ${time}` : d > 1 ? `Tra ${d} giorni · ${time}` : `${Math.abs(d)} giorni fa`,
  toHandle: "Richieste da gestire", noRequest: "Nessuna richiesta", otherNotifs: "Altre notifiche", noNotif: "Nessuna notifica",
  occupiedRooms: "Camere occupate", noActiveRoom: "Nessuna camera attiva",
  detailedStats: "Statistiche dettagliate", catKitchen: "🍽️ Cucina", catHousekeeping: "🧹 Pulizie e servizi",
  periodDay: "Giorno", periodWeek: "Settimana", periodMonth: "Mese", simulateActivity: "🎲 Simula attività",
  orders: "Ordini", requests: "Richieste", revenue: "Fatturato", distinctItems: "Articoli distinti", requestTypes: "Tipi di richiesta",
  revenueTrend: "Andamento del fatturato", everythingOrdered: "Tutto ciò che è stato ordinato", mostRequested: "Cosa chiedono di più gli ospiti",
  noOrdersPeriod: "Nessun ordine in questo periodo", noRequestsPeriod: "Nessuna richiesta in questo periodo",
  conversations: "Conversazioni", simulateChats: "🎲 Simula chat", noConversation: "Nessuna conversazione", you: "Lei: ", pickConversation: "Seleziona una conversazione",
  quickReplies: [
    "Certamente, ce ne occupiamo subito.",
    "Un attimo, la ricontatto a breve.",
    "Mandiamo subito qualcuno nella sua camera.",
    "Ci scusiamo per il disagio.",
    "La colazione viene servita fino alle 10:30 in sala.",
    "La spa è aperta dalle 9 alle 20, su prenotazione.",
    "Preso nota, grazie per il suo messaggio.",
    "Non esiti a chiederci qualsiasi altra cosa 🙏",
  ],
  replyPlaceholder: "Rispondi...", send: "Invia", guestFallback: "Ospite",
  historyToday: "Cronologia di oggi", noDeliveredToday: "Nessun ordine consegnato oggi",
  todayStats: "Statistiche di oggi", totalOrders: "Totale ordini", avgTime: "Tempo medio", minShort: (n) => `${n} min`, topDish: "Piatto più ordinato",
  seeAllStats: "Vedi tutte le statistiche →", lastDelivered: "Ultime consegne", noDelivered: "Nessun ordine consegnato", seeAllHistory: "Vedi tutta la cronologia →",
};

const arDays = (n: number) => (n === 2 ? "يومين" : n >= 3 && n <= 10 ? `${n} أيام` : `${n} يوماً`);

const ar: DashCopy = {
  locale: "ar-u-nu-latn",
  languageLabel: "اللغة",
  brand: "CHECKLY · لوحة المطبخ",
  connected: "متصل",
  tabKitchen: "المطبخ", tabReception: "الاستقبال", tabRooms: "الغرف", tabChat: "الدردشة",
  counterPending: "قيد الانتظار", counterPreparing: "قيد التحضير", counterDelivered: "تم التسليم",
  colNew: "جديدة", colPreparing: "قيد التحضير", colReady: "جاهزة / مُسلَّمة",
  emptyNew: "لا توجد طلبات جديدة", emptyPreparing: "لا شيء قيد التحضير", emptyReady: "لا شيء للتسليم",
  room: (n) => `الغرفة ${n}`,
  roomAbbr: "غرفة",
  acceptPrepare: "✓ قبول وتحضير", readyToDeliver: "← جاهز للتسليم", inDeliveryWaiting: "قيد التوصيل · بانتظار النزيل", deliveredBadge: "تم التسليم ✓",
  handledBadge: "تمت المعالجة ✓", markHandled: "✓ تحديد كمُعالَج",
  timeAgo: (time, mins) => `${time} — منذ ${mins} دقيقة`,
  total: "الإجمالي", stayTotal: "إجمالي الإقامة", dayTotal: "إجمالي اليوم", free: "مجاني",
  activeCount: (n) => `${n} قيد التنفيذ`,
  ordersItems: (o, i) => `${o} ${o === 1 ? "طلب" : "طلبات"} · ${i} ${i === 1 ? "عنصر" : "عناصر"}`,
  lateCheckoutTag: "تسجيل مغادرة متأخر", collapse: "إخفاء ↑", seeDetail: "عرض التفاصيل ←",
  arrivalsStays: "الوصول والإقامات", pmsDown: "تعذّر الاتصال بنظام الفندق", noArrivals: "لا توجد حالات وصول في الأيام القادمة",
  resaStatus: { attendu: "متوقع", arrive: "وصل", parti: "غادر" },
  relDay: (d, time) => d === 0 ? `اليوم · ${time}` : d === 1 ? `غداً · ${time}` : d === -1 ? `أمس · ${time}` : d > 1 ? `بعد ${arDays(d)} · ${time}` : `قبل ${arDays(Math.abs(d))}`,
  toHandle: "طلبات قيد المعالجة", noRequest: "لا توجد طلبات", otherNotifs: "إشعارات أخرى", noNotif: "لا توجد إشعارات",
  occupiedRooms: "الغرف المشغولة", noActiveRoom: "لا توجد غرف نشطة",
  detailedStats: "إحصاءات مفصّلة", catKitchen: "🍽️ المطبخ", catHousekeeping: "🧹 التنظيف والخدمات",
  periodDay: "يوم", periodWeek: "أسبوع", periodMonth: "شهر", simulateActivity: "🎲 محاكاة النشاط",
  orders: "الطلبات", requests: "الطلبات الخاصة", revenue: "الإيرادات", distinctItems: "عناصر مختلفة", requestTypes: "أنواع الطلبات",
  revenueTrend: "تطوّر الإيرادات", everythingOrdered: "كل ما تم طلبه", mostRequested: "أكثر ما يطلبه النزلاء",
  noOrdersPeriod: "لا توجد طلبات في هذه الفترة", noRequestsPeriod: "لا توجد طلبات خاصة في هذه الفترة",
  conversations: "المحادثات", simulateChats: "🎲 محاكاة محادثات", noConversation: "لا توجد محادثات", you: "أنت: ", pickConversation: "اختر محادثة",
  quickReplies: [
    "بالتأكيد، سنتولى الأمر فوراً.",
    "لحظة من فضلك، سأعود إليك قريباً جداً.",
    "نرسل أحداً إلى غرفتك فوراً.",
    "نعتذر بشدة عن الإزعاج.",
    "يُقدَّم الإفطار حتى الساعة 10:30 في قاعة الطعام.",
    "السبا مفتوح من 9 صباحاً حتى 8 مساءً بالحجز المسبق.",
    "تم التسجيل، شكراً على رسالتك.",
    "لا تتردد إن احتجت إلى أي شيء آخر 🙏",
  ],
  replyPlaceholder: "اكتب ردّاً...", send: "إرسال", guestFallback: "نزيل",
  historyToday: "سجل اليوم", noDeliveredToday: "لم يتم تسليم أي طلب اليوم",
  todayStats: "إحصاءات اليوم", totalOrders: "إجمالي الطلبات", avgTime: "متوسط الوقت", minShort: (n) => `${n} د`, topDish: "الطبق الأكثر طلباً",
  seeAllStats: "عرض كل الإحصاءات ←", lastDelivered: "آخر التسليمات", noDelivered: "لم يتم تسليم أي طلب", seeAllHistory: "عرض السجل كاملاً ←",
};

export const dashboardCopy: Record<Lang, DashCopy> = { fr, en, es, de, it, ar };

let nameIndex: Map<string, (lang: Lang) => string> | null = null;
function buildNameIndex() {
  const map = new Map<string, (lang: Lang) => string>();
  [...restaurationSections, ...boissonSections, ...produitSections].forEach((section) =>
    section.items.forEach((item) => map.set(item.nom, (lang) => menuItemName(item, lang))),
  );
  [...stayServices, taxeSejour].forEach((service) => map.set(service.nom, (lang) => serviceName(service, lang)));
  suiteOptions.forEach((suite) => map.set(suite.nom, () => suite.nom));
  return map;
}

/** Les commandes sont enregistrées avec le nom français ; on retrouve ici la traduction du plat, du service ou de la demande. */
export function translateOrderName(nom: string, lang: Lang): string {
  if (lang === "fr") return nom;
  nameIndex ??= buildNameIndex();
  const fromCatalog = nameIndex.get(nom);
  if (fromCatalog) return fromCatalog(lang);
  return translateServiceLabel(nom, lang);
}
