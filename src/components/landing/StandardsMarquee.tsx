"use client";

import { MARQUEE_ROWS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Term } from "./primitives";

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const pill = (k: string) => (
    <li key={k} className="shrink-0">
      <span className="card-surface inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink sm:px-5 sm:py-2.5 sm:text-[15px]">
        <Term k={k} />
      </span>
    </li>
  );
  return (
    <div className="marquee relative [overflow-x:clip] [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className={cn("marquee-track flex w-max gap-3", reverse && "reverse")}>
        <ul className="flex gap-3 pr-3">{items.map(pill)}</ul>
        <ul className="flex gap-3 pr-3" aria-hidden="true" tabIndex={-1}>
          {items.map(pill)}
        </ul>
        <ul className="flex gap-3 pr-3" aria-hidden="true" tabIndex={-1}>
          {items.map(pill)}
        </ul>
        <ul className="flex gap-3 pr-3" aria-hidden="true" tabIndex={-1}>
          {items.map(pill)}
        </ul>
      </div>
    </div>
  );
}

export function StandardsMarquee() {
  return (
    <section id="standards" aria-label="Standards MedLink speaks" className="relative scroll-mt-16 bg-canvas pb-12 pt-14 sm:pb-20 sm:pt-24">
      <p className="t-mono mb-6 text-center uppercase tracking-[0.14em] text-ink-3 sm:mb-8 text-[11px] sm:text-[13px]">Speaks the standards India mandates</p>
      <div className="flex flex-col gap-2.5 sm:gap-3">
        <Row items={MARQUEE_ROWS[0]} />
        <Row items={MARQUEE_ROWS[1]} reverse />
      </div>
    </section>
  );
}
