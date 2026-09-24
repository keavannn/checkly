import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function extractMeta(html: string, prop: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function looksTooSmall(url: string): boolean {
  const m = url.match(/(\d{2,4})x(\d{2,4})(?:\.\w+)?(?:\?|$)/);
  if (!m) return false;
  const [, w, h] = m;
  return Math.max(Number(w), Number(h)) < 250;
}

function extractImages(html: string, base: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const baseHost = (() => { try { return new URL(base).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) && urls.length < 24) {
    const abs = absolutize(m[1], base);
    if (!abs || seen.has(abs)) continue;
    if (!/^https?:\/\//i.test(abs)) continue;
    if (/\.svg(\?|$)/i.test(abs)) continue;
    if (/1x1|pixel|spacer|blank\.(gif|png)|\/tr\?|facebook\.com|google-analytics|doubleclick/i.test(abs)) continue;
    if (/\/flags\/|\/plugins\/|\/icons?\//i.test(abs)) continue;
    if (looksTooSmall(abs)) continue;
    try {
      const host = new URL(abs).hostname.replace(/^www\./, "");
      if (baseHost && host !== baseHost) continue;
    } catch { continue; }
    seen.add(abs);
    urls.push(abs);
  }
  return urls;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const rawUrl = (body as { url?: unknown } | null)?.url;
  if (!rawUrl || typeof rawUrl !== "string") {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  let target: string;
  try {
    const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    target = new URL(withProtocol).toString();
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CheeklyImport/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Le site a répondu avec une erreur (${res.status}).` }, { status: 502 });
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "Cette adresse ne semble pas être une page web." }, { status: 502 });
    }
    const html = await res.text();

    const ogSiteName = extractMeta(html, "og:site_name");
    const ogTitle = extractMeta(html, "og:title");
    const title = extractTitle(html);
    const rawName = ogSiteName || ogTitle || title || "";
    const hotelName = rawName.split(/[|\-–—·]/)[0].trim() || null;

    const ogImage = extractMeta(html, "og:image");
    const logoCandidate = ogImage ? absolutize(ogImage, target) : null;

    const images = extractImages(html, target);
    const gallery = logoCandidate ? [logoCandidate, ...images.filter((i) => i !== logoCandidate)] : images;

    return NextResponse.json({ hotelName, images: gallery.slice(0, 16) });
  } catch {
    return NextResponse.json({ error: "Impossible de récupérer ce site (bloqué, hors ligne, ou trop lent)." }, { status: 502 });
  }
}
