"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileJson, Link2, ShieldCheck } from "lucide-react";
import { EASE_EXPO, SYSTEM_VARS } from "@/components/landing/primitives";
import { RosettaOrb } from "@/components/landing/RosettaOrb";
import { HERO } from "@/lib/landing-data";

const ROWS = [
  ...HERO.chips.map((c) => ({ system: c.system, label: c.label, term: c.term })),
  { system: "icd" as const, label: HERO.core.label, term: HERO.core.term },
];

const POINTS = [
  { icon: ShieldCheck, title: "Consent-first", body: "You decide who sees your record." },
  { icon: Link2, title: "ABHA and HPR", body: "Built on India's health rails." },
  { icon: FileJson, title: "FHIR R4", body: "Standards-based records." },
];

export function AuthShowcase() {
  const reduce = useReducedMotion() ?? false;
  return (
    <aside
      aria-label="About MedLink"
      className="relative hidden flex-col justify-between gap-8 overflow-hidden border-l border-hairline bg-canvas-alt p-10 lg:flex xl:p-14"
    >
      <p className="t-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">{HERO.eyebrow}</p>

      <div className="mx-auto flex w-full max-w-[440px] flex-col items-center gap-5">
        <div className="relative aspect-square w-[min(340px,34svh)]">
          <RosettaOrb reduce={reduce} className="absolute inset-0 size-full" />
        </div>
        <ul aria-label="One diagnosis translated into four vocabularies" className="w-full overflow-hidden rounded-2xl border border-hairline bg-raised">
          {ROWS.map((r, i) => {
            const isCore = r.system === "icd";
            return (
              <motion.li
                key={r.system}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.3 + i * 0.12 }}
                className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-hairline" : ""} ${isCore ? "bg-canvas-alt" : ""}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full" style={{ background: SYSTEM_VARS[r.system].fill }} aria-hidden="true" />
                  <span className="t-mono text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: SYSTEM_VARS[r.system].text }}>
                    {r.label}
                  </span>
                </span>
                <span className={`text-[15px] ${isCore ? "font-semibold text-ink" : "text-ink"}`}>{r.term}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <ul className="grid grid-cols-3 gap-6">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <Icon className="size-5 text-link" strokeWidth={1.75} aria-hidden="true" />
            <p className="mt-2.5 text-[14px] font-semibold text-ink">{title}</p>
            <p className="mt-1 text-[13px] leading-snug text-ink-2">{body}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
