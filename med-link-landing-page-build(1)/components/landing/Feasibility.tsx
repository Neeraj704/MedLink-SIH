"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { FEASIBILITY } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, SectionHeader, SectionShell, Stagger, StaggerItem } from "./primitives";

function Challenge({ problem, solution, index }: { problem: string; solution: string; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = `challenge-${index}`;
  return (
    <div className={cn("overflow-hidden rounded-[20px] border transition-colors", open ? "border-link/40 bg-raised" : "border-hairline bg-canvas-alt")}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3 p-5 text-left">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-danger" aria-hidden="true" />
          <span className="flex-1 text-[16px] font-medium leading-snug text-ink">{problem}</span>
          <ChevronDown className={cn("mt-1 size-4 shrink-0 text-ink-3 transition-transform duration-300", open && "rotate-180")} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="flex gap-3 px-5 pb-5 text-[15px] text-ink-2">
            <Check className="mt-1 size-4 shrink-0 text-link" aria-hidden="true" />
            <span>{solution}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Feasibility() {
  return (
    <SectionShell id="feasibility" tone="white">
      <Container wide>
        <SectionHeader id="feasibility" eyebrow="Feasibility" title={FEASIBILITY.title} />
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 text-[21px] font-semibold tracking-[-0.015em] text-ink">Why it&apos;s feasible</h3>
            <Stagger as="ul" className="space-y-3">
              {FEASIBILITY.feasible.map((f) => (
                <StaggerItem as="li" key={f.title} className="glass rounded-[20px] p-5">
                  <p className="text-[16px] font-medium text-ink">{f.title}</p>
                  <p className="mt-1 text-[14px] text-ink-2">{f.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <div>
            <h3 className="mb-5 text-[21px] font-semibold tracking-[-0.015em] text-ink">Challenges, answered</h3>
            <div className="space-y-3">
              {FEASIBILITY.challenges.map((c, i) => (
                <Challenge key={c.problem} index={i} problem={c.problem} solution={c.solution} />
              ))}
            </div>
          </div>
        </div>
        <ul className="mt-14 flex flex-wrap justify-center gap-2" aria-label="Alignment">
          {FEASIBILITY.badges.map((b) => (
            <li key={b} className="rounded-full border border-hairline bg-canvas-alt px-4 py-1.5 text-[13px] font-medium text-ink">
              {b}
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}
