"use client";

import { useEffect } from "react";
import { clearOrders } from "@/lib/orders";
import { clearChats } from "@/lib/chat";

const SEEN_KEY = "checkly_last_seen";
const IDLE_MS = 30 * 60 * 1000;
const TOUCH_EVERY_MS = 15 * 1000;

/**
 * Remet la démo à zéro (commandes et chats) quand quelqu'un arrive dessus :
 * - à l'ouverture du site ou du menu de la démo, "/" ou "/demo" (adresse tapée, lien, rechargement) ;
 * - ou quand plus personne n'a touché à la démo depuis 30 minutes, quelle que soit la page ouverte.
 * Passer d'une page à l'autre dans l'app, ou ouvrir le dashboard dans un autre onglet pendant une présentation, ne remet rien à zéro.
 */
export default function DemoFreshStart() {
  useEffect(() => {
    let lastTouch = Date.now();
    try {
      const last = Number(localStorage.getItem(SEEN_KEY) || 0);
      const idle = lastTouch - last > IDLE_MS;
      const path = window.location.pathname;
      if (path === "/" || path === "/demo" || idle) {
        clearOrders();
        clearChats();
      }
      localStorage.setItem(SEEN_KEY, String(lastTouch));
    } catch { /* storage unavailable */ }

    const touch = () => {
      const now = Date.now();
      if (now - lastTouch < TOUCH_EVERY_MS) return;
      lastTouch = now;
      try { localStorage.setItem(SEEN_KEY, String(now)); } catch { /* storage unavailable */ }
    };
    window.addEventListener("pointerdown", touch);
    window.addEventListener("keydown", touch);
    return () => {
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("keydown", touch);
    };
  }, []);

  return null;
}
