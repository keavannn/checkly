export type Lang = "fr" | "en" | "es" | "de" | "it" | "ar";

export const languageOptions: { code: Lang; label: string; rtl?: boolean }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "ar", label: "العربية", rtl: true },
];

/** Choisit la traduction d'un champ (nomEn, nomEs, ...) selon la langue, avec repli sur le français. */
export function pickTranslation(lang: Lang, fr: string, byLang: Partial<Record<Exclude<Lang, "fr">, string | undefined>>): string {
  return (lang !== "fr" && byLang[lang]) || fr;
}

const dateLocales: Record<Lang, string> = { fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE", it: "it-IT", ar: "ar-SA" };

export function getStayPeriod(nights = 3, lang: Lang = "fr") {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + nights);
  const monthName = (d: Date) => d.toLocaleDateString(dateLocales[lang], { month: "long" });
  const sameMonth = start.getMonth() === end.getMonth();
  const short = `${start.getDate()} ${monthName(start)} - ${end.getDate()} ${monthName(end)}`;
  const ranges: Record<Lang, string> = {
    fr: sameMonth ? `du ${start.getDate()} au ${end.getDate()} ${monthName(end)}` : `du ${start.getDate()} ${monthName(start)} au ${end.getDate()} ${monthName(end)}`,
    en: sameMonth ? `from ${monthName(start)} ${start.getDate()} to ${end.getDate()}` : `from ${monthName(start)} ${start.getDate()} to ${monthName(end)} ${end.getDate()}`,
    es: sameMonth ? `del ${start.getDate()} al ${end.getDate()} de ${monthName(end)}` : `del ${start.getDate()} de ${monthName(start)} al ${end.getDate()} de ${monthName(end)}`,
    de: sameMonth ? `vom ${start.getDate()}. bis ${end.getDate()}. ${monthName(end)}` : `vom ${start.getDate()}. ${monthName(start)} bis ${end.getDate()}. ${monthName(end)}`,
    it: sameMonth ? `dal ${start.getDate()} al ${end.getDate()} ${monthName(end)}` : `dal ${start.getDate()} ${monthName(start)} al ${end.getDate()} ${monthName(end)}`,
    ar: sameMonth ? `من ${start.getDate()} إلى ${end.getDate()} ${monthName(end)}` : `من ${start.getDate()} ${monthName(start)} إلى ${end.getDate()} ${monthName(end)}`,
  };
  return { nights, range: ranges[lang], short };
}
