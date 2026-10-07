"use client";

import { useEffect, useState } from "react";
import { IMPACT } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-context";
import { Container, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip } from "./primitives";

function Flywheel() {
  const { reduceMotion } = useLanding();
  const [active, setActive] = useState(0);
  const nodes = IMPACT.flywheel;
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setActive((n) => (n + 1) % nodes.length), 1800);
    return () => window.clearInterval(id);
  }, [reduceMotion, nodes.length]);

  return (
    <div className="mx-auto mt-20 max-w-[760px]">
      <h3 className="text-center text-[21px] font-semibold tracking-[-0.015em] text-ink">The data flywheel</h3>
      <div className="relative mx-auto mt-8 aspect-square w-full max-w-[520px]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--hairline)" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--blue)" strokeWidth="0.8" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 34) / nodes.length - 4} 1000`} strokeDashoffset={-(active * ((2 * Math.PI * 34) / nodes.length)) - 2} transform="rotate(-90 50 50)" style={{ transition: "stroke-dashoffset 0.8s var(--ease-out-expo)" }} />
        </svg>
        <ol className="absolute inset-0">
          {nodes.map((n, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 34 * Math.cos(angle);
            const y = 50 + 34 * Math.sin(angle);
            return (
              <li key={n} className="absolute w-[34%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={active === i}
                  className={cn("w-full rounded-2xl border px-2 py-2 text-center text-[12px] font-medium leading-tight transition-all duration-500 sm:text-[13px]", active === i ? "border-link bg-raised text-ink shadow-long" : "border-hairline bg-canvas-alt text-ink-2")}
                >
                  <span className="t-mono block text-[10px] text-ink-3">{i + 1}</span>
                  {n}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-[28%] text-center">
            <p className="text-[12px] text-ink-3">Loops back to</p>
            <p className="text-[14px] font-semibold text-ink">Consultation</p>
            <div className="mt-2 flex justify-center">
              <StatusChip feature="analytics" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Impact() {
  return (
    <SectionShell id="impact" tone="grey">
      <Container>
        <SectionHeader id="impact" eyebrow="Why it matters" title={IMPACT.title} />
        <Stagger className="mt-16 grid gap-4 md:grid-cols-6">
          {IMPACT.cards.map((c, i) => (
            <StaggerItem key={c.area} className={cn("card-surface rounded-[28px] p-8", i < 2 ? "md:col-span-3" : "md:col-span-2")}>
              <p className="t-eyebrow text-ink-3">{c.area}</p>
              <p className="mt-4 text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">{c.pull}</p>
              <p className="mt-4 text-[15px] text-ink-2">{c.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <Flywheel />
        </Reveal>
      </Container>
    </SectionShell>
  );
}
