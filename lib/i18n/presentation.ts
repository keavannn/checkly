export type SiteLang = "fr" | "en";

export type Scene = {
  time: string;
  place: string;
  without: string;
  with: string;
  chip: string;
  photoAlt: string;
  screenAlt: string;
  caption: string;
  note?: string;
};

export type SiteCopy = {
  htmlLang: string;
  meta: { title: string; description: string };
  nav: { morning: string; flow: string; software: string; status: string; faq: string; menu: string };
  demo: string;
  demoShort: string;
  write: string;
  langSwitchLabel: string;
  hero: { titleA: string; titleB: string; lead: string; note: string; chipCheckin: string; chipOrder: string; photoAlt: string };
  ticker: string[];
  morning: { title: string; intro: string; without: string; withLabel: string; withoutNote: string; scenes: Scene[] };
  flow: {
    title: string;
    body: string;
    tabletTitle: string;
    tabletHello: string;
    items: string[];
    order: string;
    sent: string;
    teamTitle: string;
    columns: [string, string, string];
    orderCard: string;
    replay: string;
    note: string;
  };
  software: { title: string; body: string; softwareCol: string; stateCol: string; rows: { name: string; state: string; ok: boolean }[]; other: string };
  status: { title: string; worksTitle: string; works: string[]; notYetTitle: string; notYet: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
  close: { title: string; body: string; founder: string; photoAlt: string };
  footer: { demoData: string; credits: string };
};

export const siteCopy: Record<SiteLang, SiteCopy> = {
  fr: {
    htmlLang: "fr",
    meta: {
      title: "Checkly : une borne, une tablette de chambre et un écran d'équipe pour les hôtels",
      description:
        "Checkly réunit une borne de check-in dans le hall, une tablette dans la chambre et un écran pour l'équipe, reliés au logiciel de réception de l'hôtel. Prototype créé à Montpellier : voyez ce qui marche et ce qui reste à construire.",
    },
    nav: { morning: "La matinée", flow: "En action", software: "Logiciels", status: "Où on en est", faq: "Questions", menu: "Menu" },
    demo: "Essayer la démo",
    demoShort: "Démo",
    write: "Nous écrire",
    langSwitchLabel: "Langue du site",
    hero: {
      titleA: "Un lundi matin",
      titleB: "à la réception.",
      lead: "Checkly, c'est une borne dans le hall, une tablette dans la chambre et un écran pour l'équipe, reliés au logiciel de réception que l'hôtel utilise déjà.",
      note: "C'est un prototype, créé à Montpellier. Ce que vous voyez ici est réel, et ce qui n'existe pas encore est dit plus bas.",
      chipCheckin: "Check-in écrit dans la réservation",
      chipOrder: "Nouvelle commande · Chambre 214",
      photoAlt: "Hall d'un hôtel moderne avec un comptoir d'accueil en pierre, du bois clair et de grandes plantes.",
    },
    ticker: ["Borne de check-in", "Tablette de chambre", "Écran de l'équipe", "Branché sur Apaleo", "Français", "English", "Español", "Deutsch", "Italiano", "العربية"],
    morning: {
      title: "La même matinée, sans Checkly puis avec",
      intro: "Trois moments d'un lundi matin. À gauche, une journée sans Checkly. À droite, la même avec.",
      without: "Sans Checkly",
      withLabel: "Avec Checkly",
      withoutNote: "Des scènes types, pas des mesures.",
      scenes: [
        {
          time: "8 h 45",
          place: "Dans le hall",
          without: "Trois clients arrivent en même temps. Chacun attend son tour au comptoir, et la réception retrouve les réservations une par une.",
          with: "Le client choisit sa langue sur la borne, retrouve sa réservation avec son nom, puis peut ajouter une chambre supérieure ou un extra. Le check-in s'écrit dans la réservation du logiciel de réception.",
          chip: "Check-in écrit dans Apaleo",
          photoAlt: "Deux clients au comptoir d'accueil d'un grand hall d'hôtel, devant un réceptionniste.",
          screenAlt: "Écran de la borne : « Améliorez votre séjour », avec trois suites proposées.",
          caption: "La borne propose une chambre supérieure pendant le check-in.",
        },
        {
          time: "9 h 10",
          place: "Dans la chambre",
          without: "Un client veut des serviettes en plus et un petit-déjeuner demain. Il téléphone à la réception, qui note la demande sur un papier.",
          with: "La tablette de la chambre sert à commander à manger ou à boire, demander le ménage ou des produits, écrire à la réception et consulter son séjour. Elle parle six langues, dont l'arabe.",
          chip: "Commande envoyée à l'équipe",
          photoAlt: "Un plateau de petit-déjeuner avec jus d'orange, viennoiseries et omelette posé sur un lit d'hôtel.",
          screenAlt: "Écran de la tablette de chambre avec six rubriques : restauration, boissons, produits, ménage, concierge et mon séjour.",
          caption: "Le menu de la tablette, en français.",
        },
        {
          time: "9 h 30",
          place: "Côté équipe",
          without: "Cuisine, ménage et réception se transmettent les demandes par téléphone ou sur papier, et il faut penser à tout suivre.",
          with: "Un seul écran regroupe les demandes : chambre, nom du client, heure, puis « nouvelle », « en préparation » ou « livrée ». Il existe en six langues, et se lit de droite à gauche en arabe.",
          chip: "Nouvelle, en préparation, livrée",
          photoAlt: "Couloir d'hôtel avec un chariot de ménage et un aspirateur posés sur une moquette à motifs.",
          screenAlt: "Écran de l'équipe avec trois colonnes de commandes : nouvelles, en préparation, prêtes ou livrées.",
          caption: "L'écran de l'équipe, avec des commandes de démonstration.",
          note: "Dans la démo, la tablette et l'écran de l'équipe se parlent dans le même navigateur.",
        },
      ],
    },
    flow: {
      title: "Une demande, du client à l'équipe",
      body: "Le client commande sur la tablette de sa chambre. La demande arrive sur l'écran de l'équipe et change d'état au fil de la préparation.",
      tabletTitle: "Tablette de la chambre",
      tabletHello: "Bonjour, Joyce · Chambre 214",
      items: ["Club sandwich", "Salade César", "Café"],
      order: "Commander",
      sent: "Commande envoyée",
      teamTitle: "Écran de l'équipe",
      columns: ["Nouvelles", "En préparation", "Livrées"],
      orderCard: "Chambre 214 · Club sandwich",
      replay: "Rejouer l'animation",
      note: "Animation de démonstration. Dans la vraie démo, la tablette et l'écran de l'équipe se parlent dans le même navigateur.",
    },
    software: {
      title: "Il se branche sur votre logiciel de réception",
      body: "Checkly ne remplace pas votre logiciel : il s'y ajoute. Quand un client fait son check-in sur la borne, l'information est écrite dans sa réservation, et l'écran de l'équipe lit les arrivées du jour.",
      softwareCol: "Logiciel de réception",
      stateCol: "État aujourd'hui",
      rows: [
        { name: "Apaleo", state: "Connecté, sur un environnement de test", ok: true },
        { name: "Mews", state: "Pas encore connecté", ok: false },
        { name: "Oracle Opera", state: "Pas encore connecté", ok: false },
      ],
      other: "Vous utilisez un autre logiciel ? Dites-nous lequel : c'est ce qui décide de ce que nous branchons en premier.",
    },
    status: {
      title: "Où on en est, sans détour",
      worksTitle: "Ça marche aujourd'hui",
      works: [
        "La borne : langue, recherche de la réservation, chambre supérieure et extras, check-in écrit dans Apaleo.",
        "Le check-in d'un groupe sur la borne : 3 chambres, un seul payeur, un seul paiement (parcours simulé dans la démo).",
        "La tablette : commandes, demandes de service, messages à la réception, infos du séjour, activités et météo.",
        "L'écran de l'équipe : les demandes classées de « nouvelle » à « livrée », et les arrivées du jour, en six langues.",
      ],
      notYetTitle: "Pas encore",
      notYet: [
        "Le paiement par carte, les clés de chambre et le scan de pièce d'identité : ils sont simulés dans la démo.",
        "Les réservations de groupe lues et écrites dans le logiciel de réception : le parcours de groupe de la démo est simulé.",
        "Une vraie base de données et une connexion avec mot de passe pour l'équipe.",
        "D'autres logiciels de réception qu'Apaleo.",
      ],
    },
    faq: {
      title: "Les questions qu'on nous pose",
      items: [
        { q: "Est-ce que Checkly remplace notre logiciel de réception ?", a: "Non. Il s'y ajoute, et lit ou écrit dans les réservations qui existent déjà." },
        { q: "Et si nous n'utilisons pas Apaleo ?", a: "Aujourd'hui, seul Apaleo est connecté. Écrivez-nous pour dire quel logiciel vous utilisez : c'est ce qui décidera du prochain branchement." },
        { q: "Est-ce que je peux l'installer dans mon hôtel ?", a: "Pas encore, c'est un prototype. Vous pouvez l'essayer en ligne, et nous cherchons des hôtels qui nous disent ce qui manque." },
        { q: "Combien ça coûte ?", a: "Il n'y a pas encore de prix. Nous voulons d'abord comprendre ce qui compte vraiment pour les hôtels." },
        { q: "Et les groupes de plusieurs chambres ?", a: "La démo montre un check-in de groupe simulé : 3 chambres, un seul payeur, une seule facture. Il n'est pas encore connecté au logiciel de réception." },
        { q: "Et le contact humain ?", a: "Checkly prend les gestes répétitifs : le check-in et les demandes de service. L'accueil, le conseil et l'attention restent à l'équipe." },
      ],
    },
    close: {
      title: "Essayez-le, puis dites-nous ce qui manque.",
      body: "La démo est ouverte à tous, avec des données fictives. Si vous travaillez dans un hôtel, votre avis nous aide plus que tout.",
      founder: "Checkly est développé à Montpellier par Keavan Dubois. Le projet a démarré en mai 2026.",
      photoAlt: "Grand salon d'hôtel aux tons sable et terre cuite, avec un arbre, des banquettes et un comptoir cannelé.",
    },
    footer: {
      demoData: "Les clients, chambres et commandes montrés sur cette page sont des données de démonstration.",
      credits: "Photos : Unsplash, en illustration. Elles ne montrent ni des clients ni des hôtels qui utilisent Checkly.",
    },
  },
  en: {
    htmlLang: "en",
    meta: {
      title: "Checkly: a kiosk, a room tablet and a team screen for hotels",
      description:
        "Checkly brings a check-in kiosk in the lobby, a tablet in the room and one screen for the team, all connected to the hotel's own reception software. An early prototype from Montpellier: see what works and what is still to be built.",
    },
    nav: { morning: "The morning", flow: "In action", software: "Software", status: "Where we are", faq: "Questions", menu: "Menu" },
    demo: "Try the demo",
    demoShort: "Demo",
    write: "Write to us",
    langSwitchLabel: "Site language",
    hero: {
      titleA: "A Monday morning",
      titleB: "at the front desk.",
      lead: "Checkly is a kiosk in the lobby, a tablet in the room and one screen for the team, connected to the reception software the hotel already uses.",
      note: "It is a prototype, built in Montpellier, France. What you see here is real, and what does not exist yet is stated further down.",
      chipCheckin: "Check-in written into the booking",
      chipOrder: "New order · Room 214",
      photoAlt: "Lobby of a modern hotel with a stone reception counter, light wood panelling and large plants.",
    },
    ticker: ["Check-in kiosk", "Room tablet", "Team screen", "Connected to Apaleo", "Français", "English", "Español", "Deutsch", "Italiano", "العربية"],
    morning: {
      title: "The same morning, without Checkly and then with it",
      intro: "Three moments of a Monday morning. On the left, a day without Checkly. On the right, the same day with it.",
      without: "Without Checkly",
      withLabel: "With Checkly",
      withoutNote: "Typical scenes, not measurements.",
      scenes: [
        {
          time: "8:45",
          place: "In the lobby",
          without: "Three guests arrive at the same time. Each waits their turn at the desk, and reception finds the bookings one by one.",
          with: "The guest picks a language on the kiosk, finds the booking by name, then can add a better room or an extra. The check-in is written into the booking in the reception software.",
          chip: "Check-in written into Apaleo",
          photoAlt: "Two guests at the front desk of a large hotel lobby, in front of a receptionist.",
          screenAlt: "Kiosk screen: “Upgrade your stay”, with three suites on offer.",
          caption: "The kiosk offers a better room during check-in.",
        },
        {
          time: "9:10",
          place: "In the room",
          without: "A guest wants extra towels and breakfast tomorrow. They phone reception, who write the request on a piece of paper.",
          with: "The room tablet lets guests order food or drinks, ask for housekeeping or products, write to reception and check their stay. It speaks six languages, Arabic included.",
          chip: "Order sent to the team",
          photoAlt: "A breakfast tray with orange juice, pastries and an omelette on a hotel bed.",
          screenAlt: "Room tablet screen with six sections: food, drinks, products, housekeeping, concierge and my stay.",
          caption: "The tablet's main menu, in English.",
        },
        {
          time: "9:30",
          place: "On the team side",
          without: "Kitchen, housekeeping and reception pass requests along by phone or on paper, and someone has to remember to follow each one.",
          with: "One screen gathers the requests: room, guest name, time, then “new”, “being prepared” or “delivered”. It comes in six languages, and reads right to left in Arabic.",
          chip: "New, being prepared, delivered",
          photoAlt: "Hotel corridor with a housekeeping trolley and a vacuum cleaner on a patterned carpet.",
          screenAlt: "Team screen with three columns of orders: new, being prepared, ready or delivered.",
          caption: "The team screen, showing demonstration orders.",
          note: "In the demo, the tablet and the team screen talk to each other in the same browser.",
        },
      ],
    },
    flow: {
      title: "One request, from guest to team",
      body: "The guest orders on the room tablet. The request lands on the team screen and changes state as it is prepared.",
      tabletTitle: "Room tablet",
      tabletHello: "Hello, Joyce · Room 214",
      items: ["Club sandwich", "Caesar salad", "Coffee"],
      order: "Order",
      sent: "Order sent",
      teamTitle: "Team screen",
      columns: ["New", "Being prepared", "Delivered"],
      orderCard: "Room 214 · Club sandwich",
      replay: "Replay the animation",
      note: "Demonstration animation. In the real demo, the tablet and the team screen talk to each other in the same browser.",
    },
    software: {
      title: "It plugs into your reception software",
      body: "Checkly does not replace your software: it adds to it. When a guest checks in at the kiosk, the information is written into their booking, and the team screen reads the day's arrivals.",
      softwareCol: "Reception software",
      stateCol: "State today",
      rows: [
        { name: "Apaleo", state: "Connected, on a test environment", ok: true },
        { name: "Mews", state: "Not connected yet", ok: false },
        { name: "Oracle Opera", state: "Not connected yet", ok: false },
      ],
      other: "Use another software? Tell us which one: that decides what we connect first.",
    },
    status: {
      title: "Where we are, plainly",
      worksTitle: "Works today",
      works: [
        "The kiosk: language, booking search, better room and extras, check-in written into Apaleo.",
        "Group check-in at the kiosk: 3 rooms, one payer, one payment (a simulated flow in the demo).",
        "The tablet: orders, service requests, messages to reception, stay information, activities and weather.",
        "The team screen: requests sorted from “new” to “delivered”, and the day's arrivals, in six languages.",
      ],
      notYetTitle: "Not yet",
      notYet: [
        "Card payment, room keys and ID scanning: these are simulated in the demo.",
        "Group bookings read from and written to the reception software: the demo's group flow is simulated.",
        "A real database and a password login for the team.",
        "Reception software other than Apaleo.",
      ],
    },
    faq: {
      title: "Questions we get",
      items: [
        { q: "Does Checkly replace our reception software?", a: "No. It adds to it, and reads from or writes to the bookings that already exist." },
        { q: "What if we don't use Apaleo?", a: "Today only Apaleo is connected. Write to us with the software you use: that decides the next connection." },
        { q: "Can I install it in my hotel?", a: "Not yet, it is a prototype. You can try it online, and we are looking for hotels to tell us what is missing." },
        { q: "How much does it cost?", a: "There is no price yet. We first want to understand what really matters to hotels." },
        { q: "What about groups with several rooms?", a: "The demo shows a simulated group check-in: 3 rooms, one payer, one bill. It is not connected to the reception software yet." },
        { q: "What about the human touch?", a: "Checkly takes the repetitive tasks: check-in and service requests. Welcome, advice and attention stay with the team." },
      ],
    },
    close: {
      title: "Try it, then tell us what is missing.",
      body: "The demo is open to everyone, with made-up data. If you work in a hotel, your opinion helps us more than anything.",
      founder: "Checkly is built in Montpellier, France, by Keavan Dubois. The project started in May 2026.",
      photoAlt: "Large hotel lounge in sand and terracotta tones, with a tree, banquettes and a ribbed counter.",
    },
    footer: {
      demoData: "The guests, rooms and orders shown on this page are demonstration data.",
      credits: "Photos: Unsplash, for illustration. They show neither customers nor hotels that use Checkly.",
    },
  },
};

export const CONTACT_EMAIL = "checklypro@gmail.com";
