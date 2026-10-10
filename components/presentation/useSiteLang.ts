"use client";

import { useSyncExternalStore } from "react";
import type { SiteLang } from "@/lib/i18n/presentation";

const LANG_KEY = "checkly_site_lang";
const listeners = new Set<() => void>();
let chosen: SiteLang | null = null;

function readLang(): SiteLang {
  if (chosen) return chosen;
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function chooseLang(lang: SiteLang) {
  chosen = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l());
}

export function useSiteLang(): [SiteLang, (lang: SiteLang) => void] {
  const lang = useSyncExternalStore<SiteLang>(subscribe, readLang, () => "fr");
  return [lang, chooseLang];
}
