"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import type { SiteCopy } from "@/lib/i18n/presentation";
import { CheckCircle } from "./icons";

// Phases: 0 idle, 1 guest taps, 2 order sent (new), 3 being prepared, 4 delivered, 5 pause before looping.
const TIMINGS = [1000, 1300, 1700, 2000, 2400, 1500];
const spring = { type: "spring", stiffness: 190, damping: 24 } as const;

export default function LiveFlow({ t }: { t: SiteCopy["flow"] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(0);
  const shown = reduce ? 4 : phase;

  useEffect(() => {
    if (reduce || !inView) return;
    let p = 0;
    let id = 0;
    const tick = () => {
      setPhase(p);
      id = window.setTimeout(() => {
        p = (p + 1) % TIMINGS.length;
        tick();
      }, TIMINGS[p]);
    };
    id = window.setTimeout(tick, 150);
    return () => window.clearTimeout(id);
  }, [reduce, inView, run]);

  const column = shown < 2 ? -1 : shown === 2 ? 0 : shown === 3 ? 1 : 2;
  const badge = ["", "", t.columns[0], t.columns[1], t.columns[2], t.columns[2]][shown];

  return (
    <section className="pr-flow" id="action" aria-labelledby="pr-flow-title">
      <div className="pr-wrap">
        <div className="pr-flow-head">
          <h2 id="pr-flow-title" className="pr-h2 pr-h2--light">{t.title}</h2>
          <p className="pr-intro pr-intro--light">{t.body}</p>
        </div>

        <div className="pr-flow-stage" ref={ref}>
          <div className="pr-tablet" aria-label={t.tabletTitle}>
            <div className="pr-tablet-top"><strong>{t.tabletHello}</strong></div>
            <ul className="pr-tablet-list">
              {t.items.map((item, i) => (
                <li key={item} className={shown >= 1 && i === 0 ? "is-picked" : undefined}>
                  <span>{item}</span>
                  {shown >= 1 && i === 0 && <CheckCircle className="pr-picked-icon" />}
                </li>
              ))}
            </ul>
            <div className={`pr-tablet-btn${shown === 1 ? " is-tap" : ""}`}>
              {shown >= 2 ? <><CheckCircle className="pr-picked-icon" />{t.sent}</> : t.order}
              {shown === 1 && <motion.i className="pr-ripple" initial={{ scale: 0.2, opacity: 0.7 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} />}
            </div>
          </div>

          <div className="pr-link-line" aria-hidden="true">
            <span className="pr-link-rail" />
            <motion.span className="pr-link-dot" animate={shown === 2 ? { left: ["0%", "100%"], opacity: [1, 1, 0] } : { left: "0%", opacity: 0 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
          </div>

          <div className="pr-board" aria-label={t.teamTitle}>
            <LayoutGroup>
              {t.columns.map((name, c) => (
                <div className="pr-board-col" key={name}>
                  <div className={`pr-board-head pr-board-head--${c}`}><i aria-hidden="true" />{name}</div>
                  <div className="pr-board-slot">
                    <AnimatePresence>
                      {column === c && (
                        <motion.div layoutId="flow-order" className={`pr-order pr-order--${c}`} layout transition={spring} initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          <b>{t.orderCard}</b>
                          <span>{badge}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </LayoutGroup>
          </div>
        </div>

        <div className="pr-flow-foot">
          <p>{t.note}</p>
          {!reduce && <button type="button" className="pr-btn pr-btn--sun pr-btn--sm" onClick={() => { setPhase(0); setRun((r) => r + 1); }}>{t.replay}</button>}
        </div>
      </div>
    </section>
  );
}
