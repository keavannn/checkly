import { useEffect, useState } from "react";
import { type Lang } from "./i18n";

/* ---------- Météo (Open-Meteo, sans clé API) ---------- */

export type WeatherInfo = { tempC: number; code: number; dailyMax: number[] } | null;

const weatherCache = new Map<string, { data: WeatherInfo; ts: number }>();

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const data = await res.json();
    const r = data?.results?.[0];
    return r ? { lat: r.latitude, lon: r.longitude } : null;
  } catch {
    return null;
  }
}

async function fetchWeather(city: string): Promise<WeatherInfo> {
  const cached = weatherCache.get(city);
  if (cached && Date.now() - cached.ts < 15 * 60 * 1000) return cached.data;
  const geo = await geocodeCity(city);
  if (!geo) return null;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max&forecast_days=3&timezone=auto`);
    const data = await res.json();
    const result: WeatherInfo = {
      tempC: Math.round(data.current.temperature_2m),
      code: data.current.weather_code,
      dailyMax: (data.daily?.temperature_2m_max ?? []).map((v: number) => Math.round(v)),
    };
    weatherCache.set(city, { data: result, ts: Date.now() });
    return result;
  } catch {
    return null;
  }
}

export function useWeather(city: string): WeatherInfo {
  const [weather, setWeather] = useState<WeatherInfo>(null);
  useEffect(() => {
    let cancelled = false;
    fetchWeather(city).then((w) => { if (!cancelled) setWeather(w); });
    return () => { cancelled = true; };
  }, [city]);
  return weather;
}

const weatherWords: Record<Lang, string[]> = {
  fr: ["Ciel dégagé", "Partiellement nuageux", "Brouillard", "Pluie", "Neige", "Averses", "Orage", "Beau temps"],
  en: ["Clear sky", "Partly cloudy", "Foggy", "Rain", "Snow", "Showers", "Thunderstorm", "Fair weather"],
  es: ["Cielo despejado", "Parcialmente nublado", "Niebla", "Lluvia", "Nieve", "Chubascos", "Tormenta", "Buen tiempo"],
  de: ["Klarer Himmel", "Teilweise bewölkt", "Nebel", "Regen", "Schnee", "Schauer", "Gewitter", "Schönes Wetter"],
  it: ["Cielo sereno", "Parzialmente nuvoloso", "Nebbia", "Pioggia", "Neve", "Rovesci", "Temporale", "Bel tempo"],
  ar: ["سماء صافية", "غائم جزئياً", "ضباب", "مطر", "ثلج", "زخات مطر", "عاصفة رعدية", "طقس جميل"],
};

export function weatherLabel(code: number, lang: Lang = "fr"): { icon: string; text: string } {
  const words = weatherWords[lang];
  if (code === 0) return { icon: "☀", text: words[0] };
  if (code <= 3) return { icon: "⛅", text: words[1] };
  if (code <= 48) return { icon: "≋", text: words[2] };
  if (code <= 67) return { icon: "☂", text: words[3] };
  if (code <= 77) return { icon: "❄", text: words[4] };
  if (code <= 82) return { icon: "☂", text: words[5] };
  if (code <= 99) return { icon: "⚡", text: words[6] };
  return { icon: "☀", text: words[7] };
}
