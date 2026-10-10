"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteCopy } from "@/lib/i18n/presentation";

export default function Faq({ t }: { t: SiteCopy["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="pr-faq" id="faq" aria-labelledby="pr-faq-title">
      <div className="pr-wrap pr-wrap--narrow">
        <h2 id="pr-faq-title" className="pr-h2">{t.title}</h2>
        <div className="pr-faq-list">
          {t.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`pr-faq-item${isOpen ? " is-open" : ""}`} key={item.q}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`pr-faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{item.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div id={`pr-faq-${i}`} className="pr-faq-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
