"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { MotionConfig, motion } from "framer-motion";
import { CONTACT_EMAIL, siteCopy } from "@/lib/i18n/presentation";
import { Arrow, CheckCircle, CheckGlyph, DashedCircle } from "./icons";
import { useSiteLang } from "./useSiteLang";
import Hero from "./Hero";
import Ticker from "./Ticker";
import MorningStack from "./MorningStack";
import LiveFlow from "./LiveFlow";
import Faq from "./Faq";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Presentation() {
  const [lang, setLang] = useSiteLang();
  const t = siteCopy[lang];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t]);

  useEffect(() => {
    const nav = rootRef.current?.querySelector(".pr-nav-wrap");
    if (!nav) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => nav.classList.toggle("is-scrolled", window.scrollY > 24));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="pr" ref={rootRef} lang={t.htmlLang}>
        <header className="pr-nav-wrap">
          <div className="pr-nav">
            <a className="pr-brand" href="#top" aria-label="Checkly"><CheckGlyph /><span>Checkly</span></a>
            <nav className="pr-links" aria-label={t.nav.menu}>
              <a href="#matinee">{t.nav.morning}</a>
              <a href="#action">{t.nav.flow}</a>
              <a href="#logiciels">{t.nav.software}</a>
              <a href="#etat">{t.nav.status}</a>
              <a href="#faq">{t.nav.faq}</a>
            </nav>
            <div className="pr-nav-right">
              <div className="pr-lang" role="group" aria-label={t.langSwitchLabel}>
                {(["fr", "en"] as const).map((l) => (
                  <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                ))}
              </div>
              <Link className="pr-btn pr-btn--ink pr-btn--sm" href="/demo"><span className="pr-demo-full">{t.demo}</span><span className="pr-demo-short" aria-hidden="true">{t.demoShort}</span></Link>
            </div>
          </div>
        </header>

        <main id="top">
          <Hero t={t.hero} demo={t.demo} write={t.write} lang={lang} />
          <Ticker items={t.ticker} />
          <MorningStack t={t.morning} lang={lang} />
          <LiveFlow t={t.flow} />

          <section className="pr-soft" id="logiciels" aria-labelledby="pr-soft-title">
            <div className="pr-wrap pr-split">
              <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
                <h2 id="pr-soft-title" className="pr-h2">{t.software.title}</h2>
                <p className="pr-body">{t.software.body}</p>
                <p className="pr-body pr-body--soft">{t.software.other}</p>
                <a className="pr-btn pr-btn--ink" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(lang === "fr" ? "Mon logiciel de réception" : "My reception software")}`}>{t.write}<Arrow className="pr-btn-arrow" /></a>
              </motion.div>
              <motion.div className="pr-table-wrap" initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, delay: 0.12, ease }}>
                <table className="pr-table">
                  <thead>
                    <tr><th scope="col">{t.software.softwareCol}</th><th scope="col">{t.software.stateCol}</th></tr>
                  </thead>
                  <tbody>
                    {t.software.rows.map((r) => (
                      <tr key={r.name} className={r.ok ? "is-ok" : undefined}>
                        <th scope="row">{r.name}</th>
                        <td>{r.ok ? <CheckCircle className="pr-ok" /> : <DashedCircle className="pr-no" />}<span>{r.state}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </div>
          </section>

          <section className="pr-state" id="etat" aria-labelledby="pr-state-title">
            <div className="pr-wrap">
              <h2 id="pr-state-title" className="pr-h2">{t.status.title}</h2>
              <div className="pr-state-grid">
                <motion.div className="pr-panel pr-panel--ok" initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, ease }}>
                  <h3>{t.status.worksTitle}</h3>
                  <ul>
                    {t.status.works.map((s) => <li key={s}><CheckCircle className="pr-ok" /><span>{s}</span></li>)}
                  </ul>
                </motion.div>
                <motion.div className="pr-panel pr-panel--no" initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, delay: 0.12, ease }}>
                  <h3>{t.status.notYetTitle}</h3>
                  <ul>
                    {t.status.notYet.map((s) => <li key={s}><DashedCircle className="pr-no" /><span>{s}</span></li>)}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>

          <Faq t={t.faq} />

          <section className="pr-close" id="contact" aria-labelledby="pr-close-title">
            <div className="pr-wrap pr-close-grid">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
                <h2 id="pr-close-title" className="pr-close-title">{t.close.title}</h2>
                <p className="pr-close-body">{t.close.body}</p>
                <div className="pr-actions">
                  <Link className="pr-btn pr-btn--sun" href="/demo">{t.demo}<Arrow className="pr-btn-arrow" /></Link>
                  <a className="pr-link-light" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </div>
                <p className="pr-founder">{t.close.founder}</p>
              </motion.div>
              <motion.div className="pr-close-photo" initial={{ clipPath: "inset(14% 14% 14% 14% round 36px)", opacity: 0.4 }} whileInView={{ clipPath: "inset(0% 0% 0% 0% round 36px)", opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}>
                <Image src="/presentation/photos/lobby-lounge.jpg" alt={t.close.photoAlt} fill sizes="(min-width: 980px) 520px, 92vw" />
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="pr-foot">
          <div className="pr-wrap">
            <a className="pr-brand pr-brand--foot" href="#top"><CheckGlyph size={24} /><span>Checkly</span></a>
            <p>{t.footer.demoData}</p>
            <p>{t.footer.credits}</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
