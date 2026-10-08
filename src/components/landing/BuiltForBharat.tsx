"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cloud, Cpu, Languages, Mic, Scaling, WifiOff, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BHARAT } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-context";
import { Container, IconTile, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip } from "./primitives";

const ICONS: Record<string, LucideIcon> = { voice: Mic, offline: WifiOff, cpu: Cpu, open: Cloud, scale: Scaling };

function GreetingLoop() {
  const { reduceMotion } = useLanding();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % BHARAT.greetings.length), 2200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);
  const g = BHARAT.greetings[i];
  return (
    <div className="flex h-20 sm:h-28 items-center justify-center gap-3 sm:gap-4" role="img" aria-label="Greetings in Indian languages">
      <Languages className="size-5 sm:size-6 text-ink-3" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.span
          key={g.text}
          lang={g.lang}
          aria-hidden="true"
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ duration: 0.5 }}
          className="text-gradient-vocab text-[clamp(1.75rem,6.5vw,4.5rem)] font-semibold tracking-[-0.03em]"
        >
          {g.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function BuiltForBharat() {
  return (
    <SectionShell id="bharat" tone="grey">
      <Container>
        <SectionHeader id="bharat" eyebrow="Built for Bharat" title={BHARAT.title} sub={BHARAT.sub} />
        <div className="mt-8 sm:mt-12">
          <GreetingLoop />
        </div>
        <Stagger className="mt-8 sm:mt-12 grid gap-3 sm:gap-4 md:grid-cols-6">
          {BHARAT.tiles.map((t, i) => {
            const Icon = ICONS[t.id];
            const feature = "feature" in t ? t.feature : undefined;
            return (
              <StaggerItem key={t.id} className={cn("card-surface rounded-[20px] p-5 sm:rounded-[24px] sm:p-7", i < 2 ? "md:col-span-3" : "md:col-span-2")}>
                <div className="flex items-start justify-between gap-3">
                  <IconTile>
                    <Icon className="size-5" strokeWidth={1.75} />
                  </IconTile>
                  {feature ? <StatusChip feature={feature} /> : null}
                </div>
                <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.015em] text-ink">{t.title}</h3>
                <p className="mt-2 text-[15px] text-ink-2">{t.body}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
