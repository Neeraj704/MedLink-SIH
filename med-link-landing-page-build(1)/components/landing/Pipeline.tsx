"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Brain, Fingerprint, FileJson, Search, Send, Stethoscope, Waypoints } from "lucide-react";
import { useRef } from "react";
import { PIPELINE, PIPELINE_COPY } from "@/lib/landing-data";
import { Container, IconTile, Reveal, SectionHeader, SectionShell, StatusChip } from "./primitives";

const ICONS = [Fingerprint, Stethoscope, Search, Waypoints, FileJson, Send, Brain];
const COLORS = ["var(--icd)", "var(--ayurveda)", "var(--siddha)", "var(--unani)", "var(--icd)", "var(--ayurveda)", "var(--unani)"];

export function Pipeline() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <SectionShell id="pipeline" labelledBy="pipeline-title" tone="grey" tour="pipeline">
      <Container>
        <SectionHeader id="pipeline" eyebrow={PIPELINE_COPY.eyebrow} title={PIPELINE_COPY.title} sub={PIPELINE_COPY.sub} />
        <ol ref={listRef} className="relative mx-auto mt-20 max-w-[860px]">
          <div aria-hidden="true" className="absolute bottom-6 left-[21px] top-6 w-px bg-hairline md:left-[27px]">
            <motion.div className="h-full w-full origin-top bg-link" style={{ scaleY: progress }} />
          </div>
          {PIPELINE.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <li key={step.title} className="relative grid grid-cols-[44px_1fr] gap-5 pb-14 last:pb-0 md:grid-cols-[56px_1fr] md:gap-8">
                <Reveal y={12}>
                  <IconTile color={COLORS[i]} className="relative z-10 bg-raised md:size-14 md:rounded-[18px]">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </IconTile>
                </Reveal>
                <Reveal delay={0.05}>
                  <p className="t-mono text-ink-3">Step {String(i + 1).padStart(2, "0")}</p>
                  <h3 className="t-h3 mt-1 text-ink">{step.title}</h3>
                  <p className="t-body mt-3 max-w-[620px]">{step.body}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {step.chips.map((c) => (
                      <li key={c.label} className="card-surface inline-flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-[13px] text-ink">
                        {c.label}
                        <StatusChip feature={c.feature} label={c.label} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </SectionShell>
  );
}
