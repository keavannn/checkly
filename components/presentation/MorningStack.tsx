"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { SiteCopy, SiteLang } from "@/lib/i18n/presentation";
import { CheckCircle } from "./icons";

const PHOTOS = ["guests-arriving", "breakfast-tray", "housekeeping-corridor"];
const ease = [0.16, 1, 0.3, 1] as const;

function Screen({ i, lang, alt }: { i: number; lang: SiteLang; alt: string }) {
  if (i === 0) return <Image src={`/presentation/kiosk-upgrade-${lang}.jpg`} alt={alt} width={2880} height={1620} sizes="(min-width: 900px) 560px, 88vw" />;
  if (i === 1) return <div className="pr-tabcrop"><Image src={`/presentation/tablet-menu-${lang}.png`} alt={alt} fill sizes="(min-width: 900px) 280px, 60vw" /></div>;
  return (
    <div className="pr-crop">
      <Image src={`/presentation/dashboard-${lang}.jpg`} alt={alt} fill sizes="(min-width: 900px) 560px, 88vw" />
    </div>
  );
}

function Scene({ i, n, progress, scene, labels, lang }: { i: number; n: number; progress: MotionValue<number>; scene: SiteCopy["morning"]["scenes"][number]; labels: { without: string; withLabel: string }; lang: SiteLang }) {
  const scale = useTransform(progress, [i / n, (i + 1) / n], [1, i === n - 1 ? 1 : 0.93]);
  return (
    <motion.article className={`pr-scene pr-scene--${i}`} style={{ scale, ["--i" as string]: i }}>
      <div className="pr-scene-without">
        <Image src={`/presentation/photos/${PHOTOS[i]}.jpg`} alt={scene.photoAlt} fill sizes="(min-width: 900px) 46vw, 92vw" />
        <div className="pr-scene-scrim" aria-hidden="true" />
        <div className="pr-scene-body">
          <div className="pr-timepill"><b>{scene.time}</b><span>{scene.place}</span></div>
          <div>
            <span className="pr-tag pr-tag--coral">{labels.without}</span>
            <p>{scene.without}</p>
          </div>
        </div>
      </div>
      <div className="pr-scene-with">
        <motion.div className={`pr-device pr-device--${i}`} initial={{ opacity: 0, y: 70, rotate: i === 1 ? 0 : 1.5 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 1, ease }}>
          <Screen i={i} lang={lang} alt={scene.screenAlt} />
          {scene.extraAlt && <div className="pr-device-extra"><Image src={`/presentation/kiosk-cards-${lang}.jpg`} alt={scene.extraAlt} width={2880} height={1620} sizes="(min-width: 900px) 270px, 52vw" /></div>}
        </motion.div>
        <motion.span className="pr-chip pr-chip--scene" initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 18 }}>
          <CheckCircle className="pr-chip-icon" />{scene.chip}
        </motion.span>
        <div className="pr-scene-body pr-scene-body--with">
          <span className="pr-tag pr-tag--green"><CheckCircle className="pr-tag-icon" />{labels.withLabel}</span>
          <p>{scene.with}</p>
          {scene.note && <p className="pr-scene-note">{scene.note}</p>}
        </div>
      </div>
    </motion.article>
  );
}

export default function MorningStack({ t, lang }: { t: SiteCopy["morning"]; lang: SiteLang }) {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.3", "end end"] });
  const n = t.scenes.length;

  return (
    <section className="pr-stack" id="matinee" aria-labelledby="pr-stack-title">
      <div className="pr-wrap pr-stack-head">
        <h2 id="pr-stack-title" className="pr-h2">{t.title}</h2>
        <p className="pr-intro">{t.intro} <span>{t.withoutNote}</span></p>
      </div>
      <div className="pr-wrap pr-stack-list" ref={listRef}>
        {t.scenes.map((scene, i) => (
          <Scene key={scene.time} i={i} n={n} progress={scrollYProgress} scene={scene} labels={{ without: t.without, withLabel: t.withLabel }} lang={lang} />
        ))}
      </div>
    </section>
  );
}
