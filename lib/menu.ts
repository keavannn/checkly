import { type Lang, pickTranslation } from "./i18n";

export type MenuItem = {
  id: string; nom: string; nomEn?: string; nomEs?: string; nomDe?: string; nomIt?: string; nomAr?: string;
  prix: number; emoji: string;
  desc?: string; descEn?: string; descEs?: string; descDe?: string; descIt?: string; descAr?: string;
  allergenes?: string[];
  options?: string[]; optionsEn?: string[]; optionsEs?: string[]; optionsDe?: string[]; optionsIt?: string[]; optionsAr?: string[];
};
export type MenuSection = { id: string; label: string; labelEn?: string; labelEs?: string; labelDe?: string; labelIt?: string; labelAr?: string; icon: string; items: MenuItem[] };

export function menuItemName(item: { nom: string; nomEn?: string; nomEs?: string; nomDe?: string; nomIt?: string; nomAr?: string }, lang: Lang = "fr"): string {
  return pickTranslation(lang, item.nom, { en: item.nomEn, es: item.nomEs, de: item.nomDe, it: item.nomIt, ar: item.nomAr });
}
export function menuItemDesc(item: { desc?: string; descEn?: string; descEs?: string; descDe?: string; descIt?: string; descAr?: string }, lang: Lang = "fr"): string | undefined {
  if (!item.desc) return undefined;
  return pickTranslation(lang, item.desc, { en: item.descEn, es: item.descEs, de: item.descDe, it: item.descIt, ar: item.descAr });
}
export function sectionLabel(section: { label: string; labelEn?: string; labelEs?: string; labelDe?: string; labelIt?: string; labelAr?: string }, lang: Lang = "fr"): string {
  return pickTranslation(lang, section.label, { en: section.labelEn, es: section.labelEs, de: section.labelDe, it: section.labelIt, ar: section.labelAr });
}
const allergenTranslations: Record<string, Partial<Record<Exclude<Lang, "fr">, string>>> = {
  "Oeufs": { en: "Eggs", es: "Huevos", de: "Eier", it: "Uova", ar: "بيض" },
  "Gluten": { en: "Gluten", es: "Gluten", de: "Gluten", it: "Glutine", ar: "غلوتين" },
  "Lait": { en: "Milk", es: "Leche", de: "Milch", it: "Latte", ar: "حليب" },
  "Crustacés": { en: "Shellfish", es: "Mariscos", de: "Krustentiere", it: "Crostacei", ar: "قشريات" },
  "Poisson": { en: "Fish", es: "Pescado", de: "Fisch", it: "Pesce", ar: "سمك" },
};
export function allergenLabel(a: string, lang: Lang = "fr"): string {
  return pickTranslation(lang, a, allergenTranslations[a] ?? {});
}

export const restaurationSections: MenuSection[] = [
  { id: "entrees", label: "Entrées", labelEn: "Starters", labelEs: "Entrantes", labelDe: "Vorspeisen", labelIt: "Antipasti", labelAr: "المقبلات", icon: "🥗", items: [
    { id: "salade-cesar", nom: "Salade César", nomEn: "Caesar Salad", nomEs: "Ensalada César", nomDe: "Caesar-Salat", nomIt: "Insalata Caesar", nomAr: "سلطة سيزر", prix: 18, emoji: "🥗", desc: "Laitue, parmesan, croûtons", descEn: "Lettuce, parmesan, croutons", descEs: "Lechuga, parmesano, picatostes", descDe: "Salat, Parmesan, Croutons", descIt: "Lattuga, parmigiano, crostini", descAr: "خس، بارميزان، خبز محمص", allergenes: ["Oeufs", "Gluten", "Lait"] },
    { id: "veloute-tomate", nom: "Velouté tomate", nomEn: "Tomato Velouté", nomEs: "Velouté de tomate", nomDe: "Tomatensuppe", nomIt: "Vellutata di pomodoro", nomAr: "شوربة الطماطم", prix: 14, emoji: "🍜", desc: "Tomates fraîches, basilic", descEn: "Fresh tomatoes, basil", descEs: "Tomates frescos, albahaca", descDe: "Frische Tomaten, Basilikum", descIt: "Pomodori freschi, basilico", descAr: "طماطم طازجة، ريحان", allergenes: ["Gluten"] },
    { id: "crevettes", nom: "Crevettes grillées", nomEn: "Grilled Shrimp", nomEs: "Gambas a la plancha", nomDe: "Gegrillte Garnelen", nomIt: "Gamberi grigliati", nomAr: "روبيان مشوي", prix: 24, emoji: "🦐", desc: "Citron, herbes fraîches", descEn: "Lemon, fresh herbs", descEs: "Limón, hierbas frescas", descDe: "Zitrone, frische Kräuter", descIt: "Limone, erbe fresche", descAr: "ليمون، أعشاب طازجة", allergenes: ["Crustacés"] },
    { id: "burrata", nom: "Burrata & tomates", nomEn: "Burrata & Tomatoes", nomEs: "Burrata y tomates", nomDe: "Burrata & Tomaten", nomIt: "Burrata e pomodori", nomAr: "بوراتا مع الطماطم", prix: 22, emoji: "🧀", desc: "Tomates cerises, basilic", descEn: "Cherry tomatoes, basil", descEs: "Tomates cherry, albahaca", descDe: "Kirschtomaten, Basilikum", descIt: "Pomodorini, basilico", descAr: "طماطم كرزية، ريحان", allergenes: ["Lait"] },
    { id: "tartare", nom: "Tartare de boeuf", nomEn: "Beef Tartare", nomEs: "Tartar de ternera", nomDe: "Rindertatar", nomIt: "Tartare di manzo", nomAr: "تارتار لحم بقري", prix: 28, emoji: "🥩", desc: "Câpres, cornichons", descEn: "Capers, pickles", descEs: "Alcaparras, pepinillos", descDe: "Kapern, Gewürzgurken", descIt: "Capperi, cetriolini", descAr: "كبر، مخلل", allergenes: ["Oeufs"] },
    { id: "carpaccio", nom: "Carpaccio saumon", nomEn: "Salmon Carpaccio", nomEs: "Carpaccio de salmón", nomDe: "Lachs-Carpaccio", nomIt: "Carpaccio di salmone", nomAr: "كارباتشو السلمون", prix: 26, emoji: "🐟", desc: "Avocat, citron", descEn: "Avocado, lemon", descEs: "Aguacate, limón", descDe: "Avocado, Zitrone", descIt: "Avocado, limone", descAr: "أفوكادو، ليمون", allergenes: ["Poisson"] },
  ] },
  { id: "plats", label: "Plats", labelEn: "Main Courses", labelEs: "Platos principales", labelDe: "Hauptgerichte", labelIt: "Piatti principali", labelAr: "الأطباق الرئيسية", icon: "🍽️", items: [
    { id: "filet-boeuf", nom: "Filet de boeuf", nomEn: "Beef Fillet", nomEs: "Solomillo de ternera", nomDe: "Rinderfilet", nomIt: "Filetto di manzo", nomAr: "فيليه لحم بقري", prix: 48, emoji: "🥩", desc: "Sauce bordelaise, légumes", descEn: "Bordelaise sauce, vegetables", descEs: "Salsa bordelesa, verduras", descDe: "Bordelaise-Sauce, Gemüse", descIt: "Salsa bordolese, verdure", descAr: "صلصة بوردليز، خضار", allergenes: [] },
    { id: "sole", nom: "Sole meunière", nomEn: "Sole Meunière", nomEs: "Lenguado meunière", nomDe: "Seezunge Müllerin Art", nomIt: "Sogliola alla mugnaia", nomAr: "سمك موسى بالزبدة", prix: 42, emoji: "🐟", desc: "Beurre citron, câpres", descEn: "Lemon butter, capers", descEs: "Mantequilla de limón, alcaparras", descDe: "Zitronenbutter, Kapern", descIt: "Burro al limone, capperi", descAr: "زبدة الليمون، كبر", allergenes: ["Poisson", "Lait"] },
    { id: "risotto", nom: "Risotto truffe", nomEn: "Truffle Risotto", nomEs: "Risotto de trufa", nomDe: "Trüffelrisotto", nomIt: "Risotto al tartufo", nomAr: "ريزوتو الكمأة", prix: 38, emoji: "🍚", desc: "Truffe noire, parmesan", descEn: "Black truffle, parmesan", descEs: "Trufa negra, parmesano", descDe: "Schwarzer Trüffel, Parmesan", descIt: "Tartufo nero, parmigiano", descAr: "كمأة سوداء، بارميزان", allergenes: ["Lait"] },
    { id: "poulet", nom: "Poulet rôti", nomEn: "Roast Chicken", nomEs: "Pollo asado", nomDe: "Brathähnchen", nomIt: "Pollo arrosto", nomAr: "دجاج مشوي", prix: 34, emoji: "🍗", desc: "Jus de rôti, légumes", descEn: "Pan juices, vegetables", descEs: "Jugo de asado, verduras", descDe: "Bratensaft, Gemüse", descIt: "Fondo di cottura, verdure", descAr: "مرقة التحمير، خضار", allergenes: [] },
  ] },
  { id: "desserts", label: "Desserts", labelEn: "Desserts", labelEs: "Postres", labelDe: "Desserts", labelIt: "Dolci", labelAr: "الحلويات", icon: "🍰", items: [
    { id: "tarte-citron", nom: "Tarte citron", nomEn: "Lemon Tart", nomEs: "Tarta de limón", nomDe: "Zitronentarte", nomIt: "Crostata al limone", nomAr: "تارت الليمون", prix: 16, emoji: "🍋", desc: "Meringue, crème citron", descEn: "Meringue, lemon cream", descEs: "Merengue, crema de limón", descDe: "Baiser, Zitronencreme", descIt: "Meringa, crema al limone", descAr: "مرينغ، كريمة الليمون", allergenes: ["Oeufs", "Gluten", "Lait"] },
    { id: "creme-brulee", nom: "Crème brûlée", nomEn: "Crème Brûlée", nomEs: "Crema catalana", nomDe: "Crème brûlée", nomIt: "Crème brûlée", nomAr: "كريم بروليه", prix: 14, emoji: "🍮", desc: "Vanille Madagascar", descEn: "Madagascar vanilla", descEs: "Vainilla de Madagascar", descDe: "Madagaskar-Vanille", descIt: "Vaniglia del Madagascar", descAr: "فانيليا مدغشقر", allergenes: ["Oeufs", "Lait"] },
    { id: "fondant", nom: "Fondant chocolat", nomEn: "Chocolate Fondant", nomEs: "Volcán de chocolate", nomDe: "Schokoladenfondant", nomIt: "Tortino al cioccolato", nomAr: "فوندان الشوكولاتة", prix: 16, emoji: "🍫", desc: "Coeur coulant, glace", descEn: "Molten center, ice cream", descEs: "Corazón fundente, helado", descDe: "Flüssiger Kern, Eis", descIt: "Cuore morbido, gelato", descAr: "قلب سائل، آيس كريم", allergenes: ["Oeufs", "Gluten", "Lait"] },
  ] },
  { id: "vegetarien", label: "Végétarien", labelEn: "Vegetarian", labelEs: "Vegetariano", labelDe: "Vegetarisch", labelIt: "Vegetariano", labelAr: "نباتي", icon: "🥦", items: [
    { id: "risotto", nom: "Risotto truffe", nomEn: "Truffle Risotto", nomEs: "Risotto de trufa", nomDe: "Trüffelrisotto", nomIt: "Risotto al tartufo", nomAr: "ريزوتو الكمأة", prix: 38, emoji: "🍚", desc: "Truffe noire, parmesan", descEn: "Black truffle, parmesan", descEs: "Trufa negra, parmesano", descDe: "Schwarzer Trüffel, Parmesan", descIt: "Tartufo nero, parmigiano", descAr: "كمأة سوداء، بارميزان", allergenes: ["Lait"] },
    { id: "burrata", nom: "Burrata & tomates", nomEn: "Burrata & Tomatoes", nomEs: "Burrata y tomates", nomDe: "Burrata & Tomaten", nomIt: "Burrata e pomodori", nomAr: "بوراتا مع الطماطم", prix: 22, emoji: "🧀", desc: "Tomates cerises, basilic", descEn: "Cherry tomatoes, basil", descEs: "Tomates cherry, albahaca", descDe: "Kirschtomaten, Basilikum", descIt: "Pomodorini, basilico", descAr: "طماطم كرزية، ريحان", allergenes: ["Lait"] },
  ] },
  { id: "vegan", label: "Vegan", labelEn: "Vegan", labelEs: "Vegano", labelDe: "Vegan", labelIt: "Vegano", labelAr: "نباتي صرف", icon: "🌱", items: [
    { id: "veloute-tomate", nom: "Velouté tomate", nomEn: "Tomato Velouté", nomEs: "Velouté de tomate", nomDe: "Tomatensuppe", nomIt: "Vellutata di pomodoro", nomAr: "شوربة الطماطم", prix: 14, emoji: "🍜", desc: "Tomates fraîches, basilic", descEn: "Fresh tomatoes, basil", descEs: "Tomates frescos, albahaca", descDe: "Frische Tomaten, Basilikum", descIt: "Pomodori freschi, basilico", descAr: "طماطم طازجة، ريحان", allergenes: ["Gluten"] },
    { id: "salade-quinoa", nom: "Salade quinoa", nomEn: "Quinoa Salad", nomEs: "Ensalada de quinoa", nomDe: "Quinoa-Salat", nomIt: "Insalata di quinoa", nomAr: "سلطة الكينوا", prix: 17, emoji: "🥙", desc: "Légumes rôtis, tahini", descEn: "Roasted vegetables, tahini", descEs: "Verduras asadas, tahini", descDe: "Geröstetes Gemüse, Tahini", descIt: "Verdure arrostite, tahini", descAr: "خضار مشوية، طحينة", allergenes: [] },
  ] },
  { id: "sans-gluten", label: "Sans gluten", labelEn: "Gluten-Free", labelEs: "Sin gluten", labelDe: "Glutenfrei", labelIt: "Senza glutine", labelAr: "خالٍ من الغلوتين", icon: "🌾", items: [
    { id: "poulet", nom: "Poulet rôti", nomEn: "Roast Chicken", nomEs: "Pollo asado", nomDe: "Brathähnchen", nomIt: "Pollo arrosto", nomAr: "دجاج مشوي", prix: 34, emoji: "🍗", desc: "Jus de rôti, légumes", descEn: "Pan juices, vegetables", descEs: "Jugo de asado, verduras", descDe: "Bratensaft, Gemüse", descIt: "Fondo di cottura, verdure", descAr: "مرقة التحمير، خضار", allergenes: [] },
    { id: "carpaccio", nom: "Carpaccio saumon", nomEn: "Salmon Carpaccio", nomEs: "Carpaccio de salmón", nomDe: "Lachs-Carpaccio", nomIt: "Carpaccio di salmone", nomAr: "كارباتشو السلمون", prix: 26, emoji: "🐟", desc: "Avocat, citron", descEn: "Avocado, lemon", descEs: "Aguacate, limón", descDe: "Avocado, Zitrone", descIt: "Avocado, limone", descAr: "أفوكادو، ليمون", allergenes: ["Poisson"] },
  ] },
];

export const boissonSections: MenuSection[] = [
  { id: "cafe", label: "Café & Thé", labelEn: "Coffee & Tea", labelEs: "Café y té", labelDe: "Kaffee & Tee", labelIt: "Caffè e tè", labelAr: "القهوة والشاي", icon: "☕", items: [
    { id: "espresso", nom: "Espresso", prix: 6, emoji: "☕", options: ["Simple", "Double", "Allongé"], optionsEn: ["Single", "Double", "Long"], optionsEs: ["Simple", "Doble", "Largo"], optionsDe: ["Einfach", "Doppelt", "Verlängert"], optionsIt: ["Singolo", "Doppio", "Lungo"], optionsAr: ["عادي", "مزدوج", "طويل"] },
    { id: "cappuccino", nom: "Cappuccino", prix: 8, emoji: "🥛" },
    { id: "the-earl-grey", nom: "Thé Earl Grey", nomEn: "Earl Grey Tea", nomEs: "Té Earl Grey", nomDe: "Earl-Grey-Tee", nomIt: "Tè Earl Grey", nomAr: "شاي إيرل غراي", prix: 8, emoji: "🍵" },
    { id: "chocolat-chaud", nom: "Chocolat chaud", nomEn: "Hot Chocolate", nomEs: "Chocolate caliente", nomDe: "Heiße Schokolade", nomIt: "Cioccolata calda", nomAr: "شوكولاتة ساخنة", prix: 10, emoji: "🧋" },
  ] },
  { id: "softs", label: "Softs", labelEn: "Soft Drinks", labelEs: "Refrescos", labelDe: "Softdrinks", labelIt: "Bibite", labelAr: "المشروبات الغازية", icon: "🥤", items: [
    { id: "coca", nom: "Coca-Cola", prix: 6, emoji: "🥤" },
    { id: "jus-orange", nom: "Jus d'orange frais", nomEn: "Fresh Orange Juice", nomEs: "Zumo de naranja natural", nomDe: "Frischer Orangensaft", nomIt: "Succo d'arancia fresco", nomAr: "عصير برتقال طازج", prix: 8, emoji: "🍊" },
  ] },
  { id: "vins", label: "Vins", labelEn: "Wines", labelEs: "Vinos", labelDe: "Weine", labelIt: "Vini", labelAr: "النبيذ", icon: "🍷", items: [
    { id: "vin-rouge", nom: "Vin rouge — Lavaux", nomEn: "Red Wine — Lavaux", nomEs: "Vino tinto — Lavaux", nomDe: "Rotwein — Lavaux", nomIt: "Vino rosso — Lavaux", nomAr: "نبيذ أحمر — لافو", prix: 14, emoji: "🍷" },
    { id: "vin-blanc", nom: "Vin blanc — Chasselas", nomEn: "White Wine — Chasselas", nomEs: "Vino blanco — Chasselas", nomDe: "Weißwein — Chasselas", nomIt: "Vino bianco — Chasselas", nomAr: "نبيذ أبيض — شاسلا", prix: 13, emoji: "🥂" },
  ] },
  { id: "cocktails", label: "Cocktails", labelEn: "Cocktails", labelEs: "Cócteles", labelDe: "Cocktails", labelIt: "Cocktail", labelAr: "الكوكتيلات", icon: "🍸", items: [
    { id: "mojito", nom: "Mojito", prix: 16, emoji: "🍸" },
    { id: "spritz", nom: "Spritz", prix: 15, emoji: "🍹" },
  ] },
  { id: "alcools", label: "Alcools", labelEn: "Spirits", labelEs: "Licores", labelDe: "Spirituosen", labelIt: "Superalcolici", labelAr: "المشروبات الروحية", icon: "🥃", items: [
    { id: "whisky", nom: "Whisky", prix: 18, emoji: "🥃" },
    { id: "gin", nom: "Gin premium", nomEn: "Premium Gin", nomEs: "Ginebra premium", nomDe: "Premium-Gin", nomIt: "Gin premium", nomAr: "جن فاخر", prix: 16, emoji: "🍸" },
  ] },
  { id: "eaux", label: "Eaux", labelEn: "Water", labelEs: "Aguas", labelDe: "Wasser", labelIt: "Acque", labelAr: "المياه", icon: "💧", items: [
    { id: "eau-plate", nom: "Eau plate", nomEn: "Still Water", nomEs: "Agua sin gas", nomDe: "Stilles Wasser", nomIt: "Acqua naturale", nomAr: "مياه عادية", prix: 5, emoji: "💧" },
    { id: "eau-gazeuse", nom: "Eau gazeuse", nomEn: "Sparkling Water", nomEs: "Agua con gas", nomDe: "Sprudelwasser", nomIt: "Acqua frizzante", nomAr: "مياه غازية", prix: 5, emoji: "🫧" },
  ] },
];

export const produitSections: MenuSection[] = [
  { id: "hygiene", label: "Hygiène", labelEn: "Toiletries", labelEs: "Higiene", labelDe: "Hygieneartikel", labelIt: "Igiene", labelAr: "مستلزمات النظافة", icon: "🧴", items: [
    { id: "savon", nom: "Savon", nomEn: "Soap", nomEs: "Jabón", nomDe: "Seife", nomIt: "Sapone", nomAr: "صابون", prix: 0, emoji: "🧼" },
    { id: "dentifrice", nom: "Kit dentaire", nomEn: "Dental Kit", nomEs: "Kit dental", nomDe: "Zahnpflege-Set", nomIt: "Kit dentale", nomAr: "طقم أسنان", prix: 0, emoji: "🪥" },
  ] },
  { id: "serviettes", label: "Serviettes", labelEn: "Towels", labelEs: "Toallas", labelDe: "Handtücher", labelIt: "Asciugamani", labelAr: "المناشف", icon: "🏖️", items: [
    { id: "serviette-bain", nom: "Serviette de bain", nomEn: "Bath Towel", nomEs: "Toalla de baño", nomDe: "Badetuch", nomIt: "Asciugamano da bagno", nomAr: "منشفة استحمام", prix: 0, emoji: "🏖️" },
  ] },
  { id: "oreillers", label: "Oreillers", labelEn: "Pillows", labelEs: "Almohadas", labelDe: "Kissen", labelIt: "Cuscini", labelAr: "الوسائد", icon: "🛏️", items: [
    { id: "oreiller-moelleux", nom: "Oreiller moelleux", nomEn: "Soft Pillow", nomEs: "Almohada suave", nomDe: "Weiches Kissen", nomIt: "Cuscino morbido", nomAr: "وسادة ناعمة", prix: 0, emoji: "🛏️" },
    { id: "oreiller-ferme", nom: "Oreiller ferme", nomEn: "Firm Pillow", nomEs: "Almohada firme", nomDe: "Festes Kissen", nomIt: "Cuscino rigido", nomAr: "وسادة صلبة", prix: 0, emoji: "🛏️" },
  ] },
  { id: "peignoir", label: "Peignoir", labelEn: "Bathrobe", labelEs: "Albornoz", labelDe: "Bademantel", labelIt: "Accappatoio", labelAr: "روب استحمام", icon: "🥋", items: [
    { id: "peignoir", nom: "Peignoir", nomEn: "Bathrobe", nomEs: "Albornoz", nomDe: "Bademantel", nomIt: "Accappatoio", nomAr: "روب استحمام", prix: 0, emoji: "🥋" },
  ] },
  { id: "pharmacie", label: "Pharmacie", labelEn: "Pharmacy", labelEs: "Farmacia", labelDe: "Apotheke", labelIt: "Farmacia", labelAr: "الصيدلية", icon: "💊", items: [
    { id: "aspirine", nom: "Aspirine", nomEn: "Aspirin", nomEs: "Aspirina", nomDe: "Aspirin", nomIt: "Aspirina", nomAr: "أسبرين", prix: 0, emoji: "💊" },
  ] },
  { id: "divers", label: "Divers", labelEn: "Miscellaneous", labelEs: "Varios", labelDe: "Sonstiges", labelIt: "Vari", labelAr: "متنوعات", icon: "🔌", items: [
    { id: "chargeur", nom: "Chargeur universel", nomEn: "Universal Charger", nomEs: "Cargador universal", nomDe: "Universalladegerät", nomIt: "Caricabatterie universale", nomAr: "شاحن عام", prix: 0, emoji: "🔌" },
  ] },
];
