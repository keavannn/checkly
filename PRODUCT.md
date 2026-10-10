# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Hotel decision-makers and teams** (directors, managers, receptionists), mainly independent and small-group hotels in France, especially hotels with a business clientele. They want shorter queues at the front desk and fewer lost requests, and they already run a property management system (PMS).
- **Hotel guests**, who use the lobby kiosk and the in-room tablet in French, English, Spanish, German, Italian or Arabic.
- **Everyone else** who lands on the presentation page (confirmed by the founder): curious visitors, other founders, developers and programme reviewers. The page explains what Checkly is and what it can do, in plain words.

## Product Purpose

Checkly is a digital suite for hotels: a lobby kiosk where the guest checks in alone, a tablet in the room (room service, housekeeping, messages to reception, stay information) and one live screen for the team where every request arrives in the same place. It connects to the PMS the hotel already uses; today that is Apaleo (sandbox). It exists to take repetitive work off the front desk and to offer upgrades and extras at the right moment, without the hotel changing its reception software.

Stage: early prototype, started May 2026, built by one founder in Montpellier.

## Positioning

Check-in kiosks and online check-in are already offered by the big PMS vendors (Mews, Oracle Opera) and by marketplace apps for Apaleo, so check-in alone is not the claim. The position to test is the combination: kiosk, in-room tablet and one team screen, tied to the hotel's own PMS. The in-room tablet with request routing to a single team screen was not found as a built-in feature in a first web check (2026-10-10, vendor material only); this is a hypothesis, not a proven difference.

## Operating Context

- Live demo: https://cheeklyy.vercel.app (Next.js 16, hosted on Vercel). Pages: `/borne` (kiosk), `/tablette` (room tablet), `/dashboard-cuisine` (team screen). The marketing page lives at `/presentation`; the demo at `/` is unchanged.
- Orders and chats in the demo are stored in the visitor's browser, not in a database. The demo resets itself for a fresh visitor.
- Kiosk check-in writes to a real Apaleo sandbox reservation (upgrade and extras go in as a note; early arrival is handled). The team screen reads arrivals from Apaleo and refreshes every 15 seconds.

## Capabilities and Constraints

- Works today: kiosk flow (language, find the reservation, upgrade and extras, check-in written to Apaleo), room tablet (menu and ordering, services, chat, stay info, local activities and weather), team screen with six languages including right-to-left Arabic.
- Simulated in the demo, not connected to real hardware or payment: card and cash payment screens, key cards, ID scan.
- Not built yet: group bookings and shared payment for several rooms, a real database, sign-in on the dashboard and API routes, any PMS other than Apaleo (Mews and Opera are not connected).
- Terms to keep consistent: "borne" (lobby kiosk), "tablette de chambre" (in-room tablet), "écran de l'équipe" / "tableau de bord" (team screen), "logiciel de réception" for the PMS.

## Brand Commitments

- Name: Checkly. Contact shown publicly: checklypro@gmail.com (confirmed by the founder).
- Voice: plain, polite, honest about the prototype stage; French first with English available; the founder rejects wording that sounds like an AI or a slogan.
- Logo candidates exist in `logo-checkly/` (monogram, monogram with tick, full name); which one is final is not recorded.
- The product screens (kiosk, tablet, team screen) keep the warm paper, gold and brown palette with Playfair Display and DM Sans (`app/globals.css`).
- Website look, confirmed by the founder on 2026-10-10: the first beige-and-gold version felt too generic ("trop IA"). The presentation page now follows the manner of Mews and Oracle: fresh and colourful, large hotel photography, floating product screens, strong scroll and product animations. This is a deliberate break from the app's beige look, binding for `/presentation`; it is a standing preference, not a draft.

## Evidence on Hand

- The working demo and real screenshots that can be captured from it.
- Four early conversations with hotel and developer contacts (private; do not quote or name them on the page). They pointed to: slow PMS at check-in for multi-room payments, a corporate-clientele focus, and the need for clear differentiation from PMS-built-in check-in.
- Five free Unsplash hotel photos in `public/presentation/photos/` (Unsplash License). They are illustrations only: they are not Checkly customers or hotels, and the page says so in its credits.
- No customers, no testimonials, no case studies, no pricing, no usage metrics, no partner logos. None of these may be invented.

## Product Principles

1. Say what exists and what does not; the prototype stage is stated, never hidden.
2. Explain in the order the guest and the team live it, with plain words before any technical term.
3. Show the real product, never a mock-up of features that are not built.
4. Respect the hotel's existing software; Checkly adds to the PMS, it does not replace it.
5. Serve a French hotel visitor first and an English reader second, with the same content in both.

## Accessibility & Inclusion

The product itself ships in six languages including Arabic with right-to-left layout; the website should be readable in French and English, work on phones and desktops, and keep readable contrast and keyboard access.
