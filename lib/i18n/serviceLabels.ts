import type { Lang } from "./index";

/** Traduit les libellés de demandes réception (Ne pas déranger, Ménage à 10:00, Réveil à 07:00, Late check-out…) enregistrés en français dans les commandes. */
const serviceLabelWords: Record<Exclude<Lang, "fr">, { dnd: string; dndEnd: string; immediateCleaning: string; changeSheets: string; lateCheckout: string; cleaningAt: (h: string) => string; wakeUpAt: (h: string) => string }> = {
  en: { dnd: "Do not disturb", dndEnd: "End of Do Not Disturb", immediateCleaning: "Immediate housekeeping", changeSheets: "Change sheets", lateCheckout: "Late check-out until 2:00 PM", cleaningAt: (h) => `Housekeeping at ${h}`, wakeUpAt: (h) => `Wake-up call at ${h}` },
  es: { dnd: "No molestar", dndEnd: "Fin del modo No molestar", immediateCleaning: "Limpieza inmediata", changeSheets: "Cambiar las sábanas", lateCheckout: "Salida tardía a las 14:00", cleaningAt: (h) => `Limpieza a las ${h}`, wakeUpAt: (h) => `Despertador a las ${h}` },
  de: { dnd: "Nicht stören", dndEnd: "Ende des Modus „Nicht stören“", immediateCleaning: "Sofortige Reinigung", changeSheets: "Bettwäsche wechseln", lateCheckout: "Später Check-out bis 14:00 Uhr", cleaningAt: (h) => `Reinigung um ${h}`, wakeUpAt: (h) => `Weckruf um ${h}` },
  it: { dnd: "Non disturbare", dndEnd: "Fine della modalità Non disturbare", immediateCleaning: "Pulizia immediata", changeSheets: "Cambiare le lenzuola", lateCheckout: "Late check-out alle 14:00", cleaningAt: (h) => `Pulizia alle ${h}`, wakeUpAt: (h) => `Sveglia alle ${h}` },
  ar: { dnd: "عدم الإزعاج", dndEnd: "إنهاء وضع عدم الإزعاج", immediateCleaning: "تنظيف فوري", changeSheets: "تغيير الملاءات", lateCheckout: "تسجيل مغادرة متأخر حتى الساعة 14:00", cleaningAt: (h) => `التنظيف في ${h}`, wakeUpAt: (h) => `الإيقاظ في ${h}` },
};

export function translateServiceLabel(nom: string, lang: Lang): string {
  if (lang === "fr") return nom;
  const w = serviceLabelWords[lang];
  if (nom === "Ne pas déranger") return w.dnd;
  if (nom === "Fin du mode Ne pas déranger") return w.dndEnd;
  if (nom === "Ménage immédiat") return w.immediateCleaning;
  if (nom === "Changer les draps") return w.changeSheets;
  if (nom === "Late check-out 14h00") return w.lateCheckout;
  const menageMatch = nom.match(/^Ménage à (.+)$/);
  if (menageMatch) return w.cleaningAt(menageMatch[1]);
  const reveilMatch = nom.match(/^Réveil à (.+)$/);
  if (reveilMatch) return w.wakeUpAt(reveilMatch[1]);
  return nom;
}
