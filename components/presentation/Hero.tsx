"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { CONTACT_EMAIL, type SiteCopy, type SiteLang } from "@/lib/i18n/presentation";
import { Arrow, CheckCircle } from "./icons";

const rise = { hidden: { y: "108%" }, show: (i: number) => ({ y: "0%", transition: { delay: 0.1 + i * 0.09, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } }) };

export default function Hero({ t, demo, write, lang }: { t: SiteCopy["hero"]; demo: string; write: string; lang: SiteLang }) {
  const { scrollY } = useScroll();
  const yPhoto = useTransform(scrollY, [0, 800], [0, 60]);
  const yTablet = useTransform(scrollY, [0, 800], [0, -70]);
  const yTeam = useTransform(scrollY, [0, 800], [0, 40]);
  const words = t.titleA.split(" ");

  return (
    <section className="pr-hero">
      <div className="pr-wrap pr-hero-grid">
        <div className="pr-hero-text">
          <h1 className="pr-h1">
            {words.map((w, i) => (
              <span className="pr-clip" key={w + i}>
                <motion.span className="pr-word" variants={rise} custom={i} initial="hidden" animate="show">{w}&nbsp;</motion.span>
              </span>
            ))}
            <br />
            <span className="pr-marked">
              <span className="pr-clip">
                <motion.span className="pr-word" variants={rise} custom={words.length} initial="hidden" animate="show">{t.titleB}</motion.span>
              </span>
              <svg className="pr-marker" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true">
                <motion.path d="M6 17C70 7 130 22 200 13S330 9 394 15" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.95, duration: 0.8, ease: [0.65, 0, 0.35, 1] }} />
              </svg>
            </span>
          </h1>
          <motion.p className="pr-lead" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>{t.lead}</motion.p>
          <motion.div className="pr-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <Link className="pr-btn pr-btn--check" href="/demo">{demo}<Arrow className="pr-btn-arrow" /></Link>
            <a className="pr-btn pr-btn--ghost" href={`mailto:${CONTACT_EMAIL}`}>{write}</a>
          </motion.div>
          <motion.p className="pr-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}>
            <span className="pr-note-dot" aria-hidden="true" />{t.note}
          </motion.p>
        </div>

        <div className="pr-hero-art">
          <motion.div className="pr-art-photo" style={{ y: yPhoto }} initial={{ clipPath: "inset(100% 0% 0% 0% round 36px)" }} animate={{ clipPath: "inset(0% 0% 0% 0% round 36px)" }} transition={{ delay: 0.15, duration: 1.1, ease: [0.77, 0, 0.175, 1] }}>
            <Image src="/presentation/photos/lobby-counter.jpg" alt={t.photoAlt} fill sizes="(min-width: 980px) 540px, 92vw" loading="eager" />
          </motion.div>

          <motion.div className="pr-art-float pr-art-float--tablet" style={{ y: yTablet }}>
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 110, damping: 16 }}>
              <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}>
                <div className="pr-tabcrop"><Image src={`/presentation/tablet-menu-${lang}.png`} alt="" fill sizes="190px" loading="eager" /></div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="pr-art-float pr-art-float--team" style={{ y: yTeam }}>
            <motion.div initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.1, type: "spring", stiffness: 100, damping: 16 }}>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}>
                <div className="pr-crop pr-crop--float">
                  <Image src={`/presentation/dashboard-${lang}.jpg`} alt="" fill sizes="340px" loading="eager" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="pr-chip pr-chip--a" initial={{ opacity: 0, scale: 0.6, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.55, type: "spring", stiffness: 260, damping: 18 }}>
            <CheckCircle className="pr-chip-icon" />{t.chipCheckin}
          </motion.div>
          <motion.div className="pr-chip pr-chip--b" initial={{ opacity: 0, scale: 0.6, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 2.0, type: "spring", stiffness: 260, damping: 18 }}>
            <span className="pr-chip-pulse" aria-hidden="true" />{t.chipOrder}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
