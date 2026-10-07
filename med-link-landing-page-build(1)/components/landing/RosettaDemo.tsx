"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDashed, Search, ShieldCheck, UserCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ROSETTA, ROSETTA_COPY, SYSTEMS, type RosettaEntry, type SystemKey, type Translation } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Caption, ConfidenceRing, Container, EASE_EXPO, IconTile, MockWindow, SYSTEM_VARS, SectionHeader, SectionShell, StatusChip, Stagger, StaggerItem, TiltCard } from "./primitives";

const PRINCIPLE_ICONS = [ShieldCheck, UserCheck, CheckCircle2];

function findEntry(query: string): RosettaEntry | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  return ROSETTA.find((e) => e.keywords.some((k) => k.includes(q) || q.includes(k))) ?? null;
}

function SystemResult({ system, result, index }: { system: Exclude<SystemKey, "icd">; result: Translation; index: number }) {
  const v = SYSTEM_VARS[system];
  const meta = SYSTEMS[system];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.6, ease: EASE_EXPO, delay: 0.08 * index }}
      className="card-surface flex items-center justify-between gap-4 rounded-2xl p-4"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: v.text }}>
          <span className="size-1.5 rounded-full" style={{ background: v.fill }} aria-hidden="true" />
          {meta.label} <span className="font-normal normal-case tracking-normal text-ink-3">· {meta.vocab}</span>
        </p>
        {result.kind === "match" ? (
          <p className="mt-1 truncate text-[19px] font-semibold tracking-[-0.01em] text-ink">{result.term}</p>
        ) : result.kind === "low" ? (
          <p className="mt-1 flex items-center gap-1.5 text-[15px] font-medium text-siddha-text">
            <AlertTriangle className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Low confidence — flagged for doctor review
          </p>
        ) : (
          <p className="mt-1 flex items-center gap-1.5 text-[15px] text-ink-2">
            <CircleDashed className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            No Ayush equivalent mapped — not forced
          </p>
        )}
      </div>
      {result.kind === "match" ? <ConfidenceRing value={result.confidence} color={v.fill} label={`${meta.label}: ${result.confidence}% illustrative confidence`} /> : null}
    </motion.li>
  );
}

export function RosettaDemo() {
  const [query, setQuery] = useState(ROSETTA[0].chip);
  const entry = useMemo(() => findEntry(query), [query]);
  const systems: Exclude<SystemKey, "icd">[] = ["ayurveda", "siddha", "unani"];

  return (
    <SectionShell id="how" tone="light" tour="demo">
      <Container>
        <SectionHeader id="how" eyebrow={ROSETTA_COPY.eyebrow} title={ROSETTA_COPY.title} sub={ROSETTA_COPY.sub} />
        <div className="mx-auto mt-14 max-w-[880px]">
          <TiltCard max={4} className="rounded-[20px]">
            <MockWindow title="MedLink · Code Translation" actions={<StatusChip feature="translation" />} bodyClassName="p-5 md:p-8">
              <label htmlFor="rosetta-input" className="sr-only">
                Search a diagnosis
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-canvas-alt px-4 py-3 focus-within:border-link">
                <Search className="size-5 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
                <input
                  id="rosetta-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ROSETTA_COPY.placeholder}
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-3"
                  aria-describedby="rosetta-status"
                />
                {query ? (
                  <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="rounded-full p-1 text-ink-3 hover:text-ink">
                    <X className="size-4" strokeWidth={2} />
                  </button>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Try an example">
                {ROSETTA.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setQuery(e.chip)}
                    aria-pressed={entry?.id === e.id}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[14px] transition-colors",
                      entry?.id === e.id ? "border-link bg-[color-mix(in_oklab,var(--blue)_10%,transparent)] text-link" : "border-hairline text-ink-2 hover:text-ink",
                    )}
                  >
                    {e.chip}
                  </button>
                ))}
              </div>

              <div className="mt-8 min-h-[340px]" aria-live="polite" id="rosetta-status">
                <AnimatePresence mode="wait">
                  {entry ? (
                    <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-btn px-5 py-4 text-white">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/75">WHO ICD-11</p>
                          <p className="text-[22px] font-semibold tracking-[-0.015em]">{entry.icd.title}</p>
                        </div>
                        <span className="t-mono rounded-full bg-white/15 px-3 py-1 text-white">{entry.icd.code}</span>
                      </div>
                      <ul className="mt-3 grid gap-3">
                        {systems.map((s, i) => (
                          <SystemResult key={`${entry.id}-${s}`} system={s} result={entry.results[s]} index={i} />
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline text-center"
                    >
                      <Search className="size-7 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
                      <p className="mt-3 text-[17px] text-ink-2">{query.trim() ? "No sample match in this preview." : "Type a diagnosis to begin."}</p>
                      <p className="mt-1 text-[14px] text-ink-3">{ROSETTA_COPY.empty}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </MockWindow>
          </TiltCard>
          <Caption className="mt-4 text-center">{ROSETTA_COPY.caption}</Caption>
        </div>

        <Stagger className="mt-20 grid gap-4 md:grid-cols-3">
          {ROSETTA_COPY.principles.map((p, i) => {
            const Icon = PRINCIPLE_ICONS[i];
            return (
              <StaggerItem key={p.title} className="card-surface rounded-[28px] p-8">
                <IconTile>
                  <Icon className="size-5" strokeWidth={1.75} />
                </IconTile>
                <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.015em] text-ink">{p.title}</h3>
                <p className="t-body mt-2">{p.body}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </SectionShell>
  );
}
