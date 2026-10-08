"use client";

import { METRICS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, Counter, Reveal, SectionShell } from "./primitives";

export function Metrics() {
  return (
    <SectionShell id="numbers" tone="dark">
      <Container wide>
        <Reveal>
          <h2 id="numbers-title" className="t-eyebrow mb-8 sm:mb-14 text-center text-ink-3">
            The numbers
          </h2>
        </Reveal>
        <ul className="grid gap-x-8 gap-y-10 sm:gap-y-16 sm:grid-cols-2 lg:grid-cols-6">
          {METRICS.map((m, i) => (
            <li key={m.caption} className={cn("lg:col-span-2", i === 3 && "lg:col-start-2", i < 3 ? "" : "")}>
              <Reveal delay={i * 0.08}>
                <Counter value={m.value} prefix={m.prefix} suffix={m.suffix} className="block text-[clamp(2.4rem,7vw,6rem)] font-bold leading-none tracking-[-0.04em] text-ink" />
                <div className="mt-5 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-hairline" aria-hidden="true">
                  <div className="h-full rounded-full bg-link" style={{ width: `${m.ring * 100}%` }} />
                </div>
                <p className="mt-4 max-w-[300px] text-[15px] text-ink-2">
                  {"tag" in m && m.tag ? <span className="mr-2 rounded-full border border-hairline px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-3">{m.tag}</span> : null}
                  {m.caption}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </SectionShell>
  );
}
