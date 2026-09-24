import { type Lang } from "./i18n";

type ActivityEntry = { fr: string; en: string; es: string; de: string; it: string; ar: string };

const cityActivities: Record<string, ActivityEntry[]> = {
  lausanne: [
    { fr: "Croisière sur le lac Léman", en: "Cruise on Lake Geneva", es: "Crucero por el lago Lemán", de: "Kreuzfahrt auf dem Genfersee", it: "Crociera sul lago Lemano", ar: "رحلة بحرية في بحيرة ليمان" },
    { fr: "Route des vignes de Lavaux", en: "Lavaux vineyard route", es: "Ruta de viñedos de Lavaux", de: "Weinroute Lavaux", it: "Strada dei vigneti di Lavaux", ar: "طريق كروم لافو" },
  ],
  geneve: [
    { fr: "Balade sur le lac Léman", en: "Walk along Lake Geneva", es: "Paseo por el lago Lemán", de: "Spaziergang am Genfersee", it: "Passeggiata sul lago Lemano", ar: "نزهة على بحيرة ليمان" },
    { fr: "Excursion au Mont-Blanc", en: "Mont Blanc excursion", es: "Excursión al Mont Blanc", de: "Ausflug zum Mont Blanc", it: "Escursione al Monte Bianco", ar: "رحلة إلى مون بلان" },
  ],
  "genève": [
    { fr: "Balade sur le lac Léman", en: "Walk along Lake Geneva", es: "Paseo por el lago Lemán", de: "Spaziergang am Genfersee", it: "Passeggiata sul lago Lemano", ar: "نزهة على بحيرة ليمان" },
    { fr: "Excursion au Mont-Blanc", en: "Mont Blanc excursion", es: "Excursión al Mont Blanc", de: "Ausflug zum Mont Blanc", it: "Escursione al Monte Bianco", ar: "رحلة إلى مون بلان" },
  ],
  zurich: [
    { fr: "Tour du vieux Zurich", en: "Old Town Zurich tour", es: "Tour por el casco antiguo de Zúrich", de: "Tour durch die Zürcher Altstadt", it: "Tour della città vecchia di Zurigo", ar: "جولة في بلدة زيورخ القديمة" },
    { fr: "Excursion à l'Uetliberg", en: "Uetliberg excursion", es: "Excursión al Uetliberg", de: "Ausflug auf den Uetliberg", it: "Escursione all'Uetliberg", ar: "رحلة إلى أوتليبرغ" },
  ],
  paris: [
    { fr: "Croisière sur la Seine", en: "Seine river cruise", es: "Crucero por el Sena", de: "Seine-Flusskreuzfahrt", it: "Crociera sulla Senna", ar: "رحلة نهرية على نهر السين" },
    { fr: "Visite du musée du Louvre", en: "Louvre museum visit", es: "Visita al museo del Louvre", de: "Besuch des Louvre", it: "Visita al museo del Louvre", ar: "زيارة متحف اللوفر" },
  ],
  londres: [
    { fr: "Tour en London Eye", en: "London Eye ride", es: "Vuelta en el London Eye", de: "Fahrt mit dem London Eye", it: "Giro sul London Eye", ar: "جولة في عين لندن" },
    { fr: "Visite du British Museum", en: "British Museum visit", es: "Visita al Museo Británico", de: "Besuch des British Museum", it: "Visita al British Museum", ar: "زيارة المتحف البريطاني" },
  ],
  london: [
    { fr: "Tour en London Eye", en: "London Eye ride", es: "Vuelta en el London Eye", de: "Fahrt mit dem London Eye", it: "Giro sul London Eye", ar: "جولة في عين لندن" },
    { fr: "Visite du British Museum", en: "British Museum visit", es: "Visita al Museo Británico", de: "Besuch des British Museum", it: "Visita al British Museum", ar: "زيارة المتحف البريطاني" },
  ],
  "new york": [
    { fr: "Visite de la Statue de la Liberté", en: "Statue of Liberty visit", es: "Visita a la Estatua de la Libertad", de: "Besuch der Freiheitsstatue", it: "Visita alla Statua della Libertà", ar: "زيارة تمثال الحرية" },
    { fr: "Balade à Central Park", en: "Central Park walk", es: "Paseo por Central Park", de: "Spaziergang im Central Park", it: "Passeggiata a Central Park", ar: "نزهة في سنترال بارك" },
  ],
  rome: [
    { fr: "Visite du Colisée", en: "Colosseum visit", es: "Visita al Coliseo", de: "Besuch des Kolosseums", it: "Visita al Colosseo", ar: "زيارة الكولوسيوم" },
    { fr: "Fontaine de Trevi", en: "Trevi Fountain", es: "Fontana di Trevi", de: "Trevi-Brunnen", it: "Fontana di Trevi", ar: "نافورة تريفي" },
  ],
  milan: [
    { fr: "Visite du Duomo", en: "Duomo visit", es: "Visita al Duomo", de: "Besuch des Doms", it: "Visita al Duomo", ar: "زيارة كاتدرائية ميلانو" },
    { fr: "Shopping au Quadrilatero della Moda", en: "Shopping in the Fashion Quadrilateral", es: "Compras en el Quadrilatero della Moda", de: "Shopping im Modeviertel", it: "Shopping nel Quadrilatero della Moda", ar: "التسوق في حي الموضة" },
  ],
  barcelone: [
    { fr: "Visite de la Sagrada Familia", en: "Sagrada Familia visit", es: "Visita a la Sagrada Familia", de: "Besuch der Sagrada Família", it: "Visita alla Sagrada Família", ar: "زيارة ساغرادا فاميليا" },
    { fr: "Balade sur les Ramblas", en: "Walk along Las Ramblas", es: "Paseo por las Ramblas", de: "Spaziergang über die Ramblas", it: "Passeggiata sulle Ramblas", ar: "نزهة في رامبلاس" },
  ],
  bruxelles: [
    { fr: "Grand-Place", en: "Grand Place", es: "Grand Place", de: "Grand Place", it: "Grand Place", ar: "الساحة الكبرى" },
    { fr: "Musée Magritte", en: "Magritte Museum", es: "Museo Magritte", de: "Magritte-Museum", it: "Museo Magritte", ar: "متحف ماغريت" },
  ],
  montpellier: [
    { fr: "Place de la Comédie", en: "Place de la Comédie", es: "Place de la Comédie", de: "Place de la Comédie", it: "Place de la Comédie", ar: "ساحة الكوميديا" },
    { fr: "Balade dans l'Écusson", en: "Walk through the Écusson old town", es: "Paseo por el casco antiguo de l'Écusson", de: "Spaziergang durch die Altstadt Écusson", it: "Passeggiata nel centro storico dell'Écusson", ar: "نزهة في البلدة القديمة إيكوسون" },
  ],
};

const defaultActivities: ActivityEntry[] = [
  { fr: "Visite guidée de la ville", en: "Guided city tour", es: "Visita guiada de la ciudad", de: "Geführte Stadttour", it: "Tour guidato della città", ar: "جولة سياحية مرشدة في المدينة" },
  { fr: "Découverte gastronomique locale", en: "Local food discovery", es: "Descubrimiento gastronómico local", de: "Lokale kulinarische Entdeckung", it: "Scoperta gastronomica locale", ar: "اكتشاف المأكولات المحلية" },
];

export function getActivities(city: string, lang: Lang = "fr"): string[] {
  const list = cityActivities[city.trim().toLowerCase()] ?? defaultActivities;
  return list.map((a) => a[lang]);
}

