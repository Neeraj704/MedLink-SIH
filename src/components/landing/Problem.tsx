"use client";

import { motion, useInView } from "framer-motion";
import { FileWarning, Layers, Receipt, SearchX } from "lucide-react";
import { useRef } from "react";
import { PROBLEM } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, IconTile, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem } from "./primitives";

const ICONS = [FileWarning, Layers, Receipt, SearchX];
const ICON_COLORS = ["var(--ayurveda)", "var(--siddha)", "var(--unani)", "var(--icd)"];

function Beat({ index, title, body }: { index: number; title: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const active = useInView(ref, { margin: "-42% 0px -42% 0px" });
  return (
    <li ref={ref} className="grid grid-cols-[auto_1fr] gap-x-6 py-10 md:gap-x-10 md:py-14">
      <span className="t-mono pt-3 text-ink-3" aria-hidden="true">
        0{index + 1}
      </span>
      <div>
        <motion.p
          className="text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]"
          animate={{ color: active ? "var(--ink)" : "var(--ink-3)", opacity: active ? 1 : 0.55 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.p>
        <motion.p className="t-body mt-4 max-w-[560px] text-[19px]" animate={{ opacity: active ? 1 : 0.4 }} transition={{ duration: 0.5 }}>
          {body}
        </motion.p>
      </div>
    </li>
  );
}

export function Problem() {
  return (
    <SectionShell id="problem" tone="grey">
      <Container>
        <SectionHeader id="problem" eyebrow="The problem" eyebrowColor="var(--danger)" title={PROBLEM.title} sub={PROBLEM.sub} />
        <ol className="mx-auto mt-16 max-w-[880px] divide-y divide-hairline" aria-label="A diagnosis, lost in translation">
          {PROBLEM.beats.map((b, i) => (
            <Beat key={b.title} index={i} title={b.title} body={b.body} />
          ))}
        </ol>
        <Stagger className="mt-20 grid gap-4 sm:grid-cols-2">
          {PROBLEM.breaks.map((b, i) => {
            const Icon = ICONS[i];
            return (
              <StaggerItem key={b.title} className="card-surface rounded-[28px] p-8 md:p-10">
                <IconTile color={ICON_COLORS[i]}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </IconTile>
                <h3 className="t-h3 mt-6 text-ink">{b.title}</h3>
                <p className="t-body mt-3">{b.body}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal className="mt-24 text-center">
          <p className={cn("t-h2 text-gradient-vocab inline-block")}>{PROBLEM.closing}</p>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
