"use client";

import { ArrowUpRight } from "lucide-react";
import { REFERENCES, TEAM } from "@/lib/landing-data";
import { Container, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem } from "./primitives";

const GRADIENTS = [
  "color-mix(in oklab, var(--ayurveda) 22%, transparent)",
  "color-mix(in oklab, var(--siddha) 22%, transparent)",
  "color-mix(in oklab, var(--unani) 22%, transparent)",
];

export function ResearchTeam() {
  return (
    <SectionShell id="research" tone="grey">
      <Container>
        <SectionHeader id="research" eyebrow="References" title="Built on research." />
        <Stagger as="ol" className="mx-auto mt-16 max-w-[820px] divide-y divide-hairline">
          {REFERENCES.map((r, i) => (
            <StaggerItem as="li" key={r.title} className="grid grid-cols-[auto_1fr] gap-x-6 py-5">
              <span className="t-mono pt-1 text-ink-3" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  {"url" in r && r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-link hover:underline">
                      {r.title}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : (
                    r.title
                  )}
                </p>
                <p className="mt-1 text-[15px] text-ink-2">{r.took}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mx-auto mt-20 max-w-[820px]">
          <div className="glass rounded-[28px] p-8 md:p-10">
            <p className="t-eyebrow text-ink-3">The team</p>
            <p className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-ink">{TEAM.university}</p>
            <p className="text-[15px] text-ink-2">
              {TEAM.department} · {TEAM.program}
            </p>
            <p className="mt-6 text-[14px] text-ink-3">Project guide</p>
            <p className="text-[17px] text-ink">{TEAM.guide}</p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {TEAM.members.map((m, i) => (
                <li key={m.id} className="flex items-center gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-ink" style={{ background: GRADIENTS[i % GRADIENTS.length] }} aria-hidden="true">
                    {m.initials}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-ink">{m.name}</p>
                    <p className="t-mono text-[12px] text-ink-3">{m.id}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
