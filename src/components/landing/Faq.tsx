"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { FAQ } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeader, SectionShell } from "./primitives";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SectionShell id="faq" tone="white">
      <Container>
        <SectionHeader id="faq" eyebrow="FAQ" title="Honest answers." />
        <Reveal className="mx-auto mt-14 max-w-[820px] divide-y divide-hairline border-y border-hairline">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[18px] font-medium tracking-[-0.01em] text-ink">
                    {f.q}
                    <Plus className={cn("size-5 shrink-0 text-ink-3 transition-transform duration-300", isOpen && "rotate-45")} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-8 text-[16px] leading-relaxed text-ink-2">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </SectionShell>
  );
}
