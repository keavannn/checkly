---
version: 1
slug: "app-presentation-page-tsx"
primary_target: "app/presentation/page.tsx"
related_targets: []
---

# Surface brief: /presentation

Scope: the public presentation page of Checkly, route `/presentation` of the existing Next.js app. Visitor mode: Persuade. The demo at `/` stays untouched. Second version (2026-10-10): the founder judged version one too generic and asked for a look "like Mews or Oracle": photos, fresh and colourful, strong animations.

Audience: everyone, led by hotel teams. Job: understand in seconds what Checkly is and does, see the real product, learn honestly what exists and what does not, then try the demo or write. Action: "Essayer la démo" (links to `/`), e-mail checklypro@gmail.com. Proof: real captures of the kiosk, room tablet and team screen from the live demo; Apaleo as the connected software. Constraints: no customers, prices, metrics or testimonials; prototype stage stated; French first with English; phone and desktop; free Unsplash photos are illustrations, credited as such.

Direction pinned by the brief (the founder named Mews and Oracle and answered the style round: "frais et coloré", free hotel photos, "animations marquées"), so no direction roll was run. Concept kept from version one: one Monday morning told twice, without and with Checkly.

## Direction contract

THESIS: One Monday morning at a hotel, told as three stacked scenes: the left half is the plain day without Checkly in muted photography, the right half is the same moment with the real product floating in colour. A live animation then shows one request travelling from the room tablet to the team screen. No feature grid, no icon cards.

OWN-WORLD: Fresh hospitality palette: mist-white ground, deep forest green fields, a bright "check" green, mint tints, a sun-yellow highlight, coral only for friction on the "without" side. Bricolage Grotesque in heavy weights for display, Figtree for reading. Big rounded photo frames (28px radius), pill buttons, floating product screens with soft offset shadows, sun-yellow marker underline on the key words. Recognizable with the text removed by the green fields, the grayscale-versus-colour split and the floating screens.

STORY: The visitor reads a headline, sees a real lobby with the product floating over it, then follows 8 h 45, 9 h 10, 9 h 30 as photographs and screens. They watch a request move between devices, learn it plugs into the software the hotel already has, read exactly what is built and what is not, and leave through the demo button or the e-mail.

FIRST VIEWPORT: Floating rounded nav bar (wordmark with check mark, links, FR/EN, demo button). Left: huge two-line headline "Un lundi matin à la réception." with a sun-yellow marker under "à la réception.", one plain sentence, a green primary button "Essayer la démo" and a ghost "Nous écrire". Right: a tall rounded lobby photograph with the real tablet screen and team screen floating over its edges and two small live chips ("Check-in écrit", "Nouvelle commande") that pop in. A forest-green ticker strip starts at the fold.

FORM: Avant / après (dealt candidate 3 of 7, seed key 47280aac), rebuilt as stacking scenes with a live product animation; direction pinned by the brief.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Whether to keep the founder's name in the closing lines (default: yes).
- Final logo file (the wordmark is set in type with a drawn check mark).
- Provenance: product screenshots from https://cheeklyy.vercel.app via `C:\Dev\checkly-video\site-shots.mjs`; photos are Unsplash (`public/presentation/photos/CREDITS.txt`).
