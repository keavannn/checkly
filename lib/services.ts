import { type Lang, pickTranslation } from "./i18n";

export type PricingType = "per_person_per_day" | "per_day" | "per_duration" | "per_person" | "per_quantity" | "fixed";

export type ServiceOption = {
  id: string;
  nom: string;
  nomEn?: string;
  nomEs?: string;
  nomDe?: string;
  nomIt?: string;
  nomAr?: string;
  icone: string;
  prix: number;
  pricingType: PricingType;
  dureeHeures?: number; // taille d'une tranche facturée, pour pricingType "per_duration"
  maxQty?: number; // quantité/tranches maximum sélectionnables (défaut 1)
};

export type StayContext = { nights: number; guests: number; currency: string };

export function serviceName(item: { nom: string; nomEn?: string; nomEs?: string; nomDe?: string; nomIt?: string; nomAr?: string }, lang: Lang = "fr"): string {
  return pickTranslation(lang, item.nom, { en: item.nomEn, es: item.nomEs, de: item.nomDe, it: item.nomIt, ar: item.nomAr });
}

export function formatPrice(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${currency}`;
}

const freeWord: Record<Lang, string> = { fr: "Gratuit", en: "Free", es: "Gratis", de: "Kostenlos", it: "Gratuito", ar: "مجاني" };

const unitLabelByLang: Record<Lang, (t: PricingType, base: string, h: number) => string> = {
  fr: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / jour / personne`;
      case "per_day": return `${base} / jour`;
      case "per_duration": return `${base} / ${h} heures`;
      case "per_person": return `${base} / personne`;
      case "per_quantity": return `${base} / unité`;
      case "fixed": default: return base;
    }
  },
  en: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / day / guest`;
      case "per_day": return `${base} / day`;
      case "per_duration": return `${base} / ${h}h`;
      case "per_person": return `${base} / guest`;
      case "per_quantity": return `${base} / unit`;
      case "fixed": default: return base;
    }
  },
  es: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / día / persona`;
      case "per_day": return `${base} / día`;
      case "per_duration": return `${base} / ${h}h`;
      case "per_person": return `${base} / persona`;
      case "per_quantity": return `${base} / unidad`;
      case "fixed": default: return base;
    }
  },
  de: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / Tag / Person`;
      case "per_day": return `${base} / Tag`;
      case "per_duration": return `${base} / ${h} Std.`;
      case "per_person": return `${base} / Person`;
      case "per_quantity": return `${base} / Einheit`;
      case "fixed": default: return base;
    }
  },
  it: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / giorno / persona`;
      case "per_day": return `${base} / giorno`;
      case "per_duration": return `${base} / ${h}h`;
      case "per_person": return `${base} / persona`;
      case "per_quantity": return `${base} / unità`;
      case "fixed": default: return base;
    }
  },
  ar: (t, base, h) => {
    switch (t) {
      case "per_person_per_day": return `${base} / لليلة / للشخص`;
      case "per_day": return `${base} / لليلة`;
      case "per_duration": return `${base} / ${h} ساعات`;
      case "per_person": return `${base} / للشخص`;
      case "per_quantity": return `${base} / للوحدة`;
      case "fixed": default: return base;
    }
  },
};

export function unitPriceLabel(service: ServiceOption, currency: string, lang: Lang = "fr"): string {
  if (service.prix === 0) return freeWord[lang];
  const base = formatPrice(service.prix, currency);
  return unitLabelByLang[lang](service.pricingType, base, service.dureeHeures ?? 1);
}

export type PriceResult = { total: number; detailLabel: string };

const countWords: Record<Lang, { person: [string, string]; night: [string, string]; session: [string, string] }> = {
  fr: { person: ["personne", "personnes"], night: ["jour", "jours"], session: ["séance", "séances"] },
  en: { person: ["guest", "guests"], night: ["night", "nights"], session: ["session", "sessions"] },
  es: { person: ["persona", "personas"], night: ["noche", "noches"], session: ["sesión", "sesiones"] },
  de: { person: ["Person", "Personen"], night: ["Nacht", "Nächte"], session: ["Sitzung", "Sitzungen"] },
  it: { person: ["persona", "persone"], night: ["notte", "notti"], session: ["sessione", "sessioni"] },
  ar: { person: ["شخص", "أشخاص"], night: ["ليلة", "ليالٍ"], session: ["جلسة", "جلسات"] },
};

export function computeServicePrice(service: ServiceOption, ctx: StayContext, quantity = 1, lang: Lang = "fr"): PriceResult {
  const base = service.prix;
  const words = countWords[lang];
  const plural = (n: number, [sing, plur]: [string, string]) => `${n} ${n > 1 ? plur : sing}`;
  if (base === 0) return { total: 0, detailLabel: freeWord[lang] };
  switch (service.pricingType) {
    case "per_person_per_day": {
      const total = base * ctx.guests * ctx.nights;
      return { total, detailLabel: `${formatPrice(base, ctx.currency)} × ${plural(ctx.guests, words.person)} × ${plural(ctx.nights, words.night)}` };
    }
    case "per_day": {
      const total = base * ctx.nights;
      return { total, detailLabel: `${formatPrice(base, ctx.currency)} × ${plural(ctx.nights, words.night)}` };
    }
    case "per_duration": {
      const total = base * quantity;
      const h = (service.dureeHeures ?? 1) * quantity;
      return { total, detailLabel: `${formatPrice(base, ctx.currency)} × ${plural(quantity, words.session)} (${h}h)` };
    }
    case "per_person": {
      const total = base * ctx.guests;
      return { total, detailLabel: `${formatPrice(base, ctx.currency)} × ${plural(ctx.guests, words.person)}` };
    }
    case "per_quantity": {
      const total = base * quantity;
      return { total, detailLabel: `${formatPrice(base, ctx.currency)} × ${quantity}` };
    }
    case "fixed":
    default:
      return { total: base, detailLabel: formatPrice(base, ctx.currency) };
  }
}

export const stayServices: ServiceOption[] = [
  { id: "petit-dejeuner", nom: "Petit-déjeuner", nomEn: "Breakfast", nomEs: "Desayuno", nomDe: "Frühstück", nomIt: "Colazione", nomAr: "الإفطار", icone: "☕", prix: 10, pricingType: "per_person_per_day" },
  { id: "spa", nom: "Accès spa", nomEn: "Spa access", nomEs: "Acceso al spa", nomDe: "Spa-Zugang", nomIt: "Accesso alla spa", nomAr: "دخول السبا", icone: "✦", prix: 50, pricingType: "per_duration", dureeHeures: 3, maxQty: 3 },
  { id: "champagne", nom: "Champagne en chambre", nomEn: "Champagne in room", nomEs: "Champán en la habitación", nomDe: "Champagner aufs Zimmer", nomIt: "Champagne in camera", nomAr: "شمبانيا في الغرفة", icone: "⌇", prix: 80, pricingType: "fixed" },
  { id: "lit-bebe", nom: "Lit bébé", nomEn: "Baby cot", nomEs: "Cuna para bebé", nomDe: "Babybett", nomIt: "Lettino per bambini", nomAr: "سرير طفل", icone: "⌂", prix: 0, pricingType: "fixed" },
  { id: "late-checkout", nom: "Late check-out", nomEn: "Late check-out", nomEs: "Salida tardía", nomDe: "Später Check-out", nomIt: "Late check-out", nomAr: "تسجيل مغادرة متأخر", icone: "◷", prix: 40, pricingType: "fixed" },
  { id: "parking", nom: "Parking", nomEn: "Parking", nomEs: "Aparcamiento", nomDe: "Parkplatz", nomIt: "Parcheggio", nomAr: "موقف سيارات", icone: "▣", prix: 20, pricingType: "per_day" },
  { id: "transfert-aeroport", nom: "Transfert aéroport retour", nomEn: "Return airport transfer", nomEs: "Traslado de vuelta al aeropuerto", nomDe: "Rücktransfer zum Flughafen", nomIt: "Transfer di ritorno in aeroporto", nomAr: "توصيلة العودة إلى المطار", icone: "↗", prix: 90, pricingType: "fixed" },
];

export type SuiteOption = { id: string; nom: string; detail: string; detailEn?: string; detailEs?: string; detailDe?: string; detailIt?: string; detailAr?: string; prix: number; pricingType: PricingType };

export const suiteOptions: SuiteOption[] = [
  { id: "suite-junior", nom: "Suite Junior", detail: "Vue lac · 45m² · Balcon", detailEn: "Lake view · 45m² · Balcony", detailEs: "Vista al lago · 45m² · Balcón", detailDe: "Seeblick · 45m² · Balkon", detailIt: "Vista lago · 45m² · Balcone", detailAr: "إطلالة على البحيرة · 45م² · شرفة", prix: 89, pricingType: "per_day" },
  { id: "suite-prestige", nom: "Suite Prestige", detail: "Vue lac · 80m² · Terrasse", detailEn: "Lake view · 80m² · Terrace", detailEs: "Vista al lago · 80m² · Terraza", detailDe: "Seeblick · 80m² · Terrasse", detailIt: "Vista lago · 80m² · Terrazza", detailAr: "إطلالة على البحيرة · 80م² · تراس", prix: 189, pricingType: "per_day" },
  { id: "suite-royale", nom: "Suite Royale", detail: "Vue panoramique · 120m²", detailEn: "Panoramic view · 120m²", detailEs: "Vista panorámica · 120m²", detailDe: "Panoramablick · 120m²", detailIt: "Vista panoramica · 120m²", detailAr: "إطلالة بانورامية · 120م²", prix: 320, pricingType: "per_day" },
];

export const taxeSejour: ServiceOption = { id: "taxe-sejour", nom: "Taxe de séjour", nomEn: "Tourist tax", nomEs: "Tasa turística", nomDe: "Kurtaxe", nomIt: "Tassa di soggiorno", nomAr: "ضريبة الإقامة", icone: "◇", prix: 3.5, pricingType: "per_person_per_day" };
