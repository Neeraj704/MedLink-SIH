"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, CheckCircle2, Cpu, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { SETU } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Caption, Container, Counter, EASE_EXPO, Glass, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip, Term } from "./primitives";

type Mode = keyof typeof SETU.hybridDemo.modes;
const MODES: Mode[] = ["keyword", "semantic", "hybrid"];

function HybridDemo() {
  const [mode, setMode] = useState<Mode>("hybrid");
  const current = SETU.hybridDemo.modes[mode];
  const ok = current.hit === 2;
  return (
    <Glass className="p-4 sm:p-6 md:p-8">
      <p className="t-mono text-ink-3">Query</p>
      <p className="mt-1 text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em] text-ink">“{SETU.hybridDemo.query}”</p>
      <div role="tablist" aria-label="Retrieval mode" className="mt-5 sm:mt-6 flex max-w-full overflow-x-auto no-scrollbar rounded-full border border-hairline p-1">
        {MODES.map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            id={`hybrid-tab-${m}`}
            aria-selected={mode === m}
            aria-controls="hybrid-panel"
            onClick={() => setMode(m)}
            className={cn("relative shrink-0 rounded-full px-3 py-1 text-[12.5px] sm:px-4 sm:py-1.5 sm:text-[14px] font-medium transition-colors", mode === m ? "text-white" : "text-ink-2 hover:text-ink")}
          >
            {mode === m ? <motion.span layoutId="hybrid-pill" className="absolute inset-0 rounded-full bg-btn" transition={{ type: "spring", stiffness: 380, damping: 32 }} /> : null}
            <span className="relative">{SETU.hybridDemo.modes[m].label}</span>
          </button>
        ))}
      </div>
      <div id="hybrid-panel" role="tabpanel" aria-labelledby={`hybrid-tab-${mode}`} aria-live="polite" className="mt-6 min-h-[124px]">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE_EXPO }}>
            <p className={cn("flex items-center gap-2 text-[21px] font-semibold tracking-[-0.015em]", ok ? "text-ayurveda-text" : current.hit === 1 ? "text-siddha-text" : "text-danger")}>
              {ok ? <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden="true" /> : <XCircle className="size-5" strokeWidth={2} aria-hidden="true" />}
              {current.result}
            </p>
            <p className="t-body mt-2">{current.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <Caption className="mt-4">{SETU.hybridDemo.caption}</Caption>
    </Glass>
  );
}

export function SetuEngine() {
  return (
    <SectionShell id="engine" tone="dark" className="overflow-hidden">
      <Container className="relative">
        <SectionHeader id="engine" eyebrow={SETU.eyebrow} eyebrowColor="var(--siddha)" title={SETU.title} sub={SETU.sub} />
        <Reveal className="mt-6 text-center">
          <p className="text-ink-2">
            <span lang="sa" className="text-[22px] text-ink">
              {SETU.note.word}
            </span>{" "}
            · {SETU.note.meaning}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <Glass className="h-full p-6 md:p-8">
              <h3 className="t-h3 text-ink">Runtime path</h3>
              <ol className="mt-6 flex flex-col items-start">
                {SETU.runtime.map((r, i) => (
                  <li key={r.label} className="flex flex-col items-start">
                    <span className="inline-flex flex-wrap items-center gap-2 rounded-full border border-hairline bg-raised/60 px-4 py-2 text-[15px] text-ink">
                      {r.label === "Pinecone ANN top-k + BM25" ? (
                        <>
                          Pinecone <Term k="ANN" /> top-k + <Term k="BM25" />
                        </>
                      ) : r.label === "Reciprocal Rank Fusion" ? (
                        <Term k="RRF">Reciprocal Rank Fusion</Term>
                      ) : (
                        r.label
                      )}
                      {r.feature ? <StatusChip feature={r.feature} /> : null}
                    </span>
                    {i < SETU.runtime.length - 1 ? <ArrowDown className="my-1 ml-5 size-4 text-ink-3" strokeWidth={1.5} aria-hidden="true" /> : null}
                  </li>
                ))}
              </ol>
              <div className="mt-8 border-t border-hairline pt-6">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <ShieldCheck className="size-4 text-ayurveda" strokeWidth={2} aria-hidden="true" />
                  Guardrails
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {SETU.guardrails.map((g) => (
                    <li key={g} className="rounded-full bg-[color-mix(in_oklab,var(--ayurveda)_14%,transparent)] px-3 py-1 text-[13px] font-medium text-ayurveda-text">
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </Glass>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal>
              <HybridDemo />
            </Reveal>
            <Reveal delay={0.05}>
              <Glass className="p-6 md:p-8">
                <h3 className="t-h3 text-ink">Ingestion</h3>
                <ol className="mt-5 space-y-4">
                  {SETU.ingestion.map((s, i) => (
                    <li key={s.title} className="grid grid-cols-[28px_1fr] gap-3">
                      <span className="t-mono pt-0.5 text-ink-3">{i + 1}</span>
                      <div>
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                          {s.title}
                          {s.feature ? <StatusChip feature={s.feature} /> : null}
                        </p>
                        <p className="t-body text-[15px]">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Glass>
            </Reveal>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Glass className="h-full p-6 md:p-8">
              <h3 className="t-h3 text-ink">Index schema</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {SETU.schema.map((s) => (
                  <li key={s} className="t-mono rounded-lg border border-hairline px-2.5 py-1 text-ink">
                    {s}
                  </li>
                ))}
              </ul>
            </Glass>
          </Reveal>
          <Reveal delay={0.05}>
            <Glass className="h-full p-6 md:p-8">
              <h3 className="t-h3 text-ink">FHIR terminology operations</h3>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {SETU.ops.map((o) => (
                  <div key={o.op}>
                    <dt className="t-mono text-siddha-text">{o.op}</dt>
                    <dd className="mt-0.5 text-[14px] text-ink-2">{o.body}</dd>
                  </div>
                ))}
              </dl>
            </Glass>
          </Reveal>
        </div>

        <Stagger className="mt-20 grid grid-cols-2 gap-y-12 md:grid-cols-4">
          {SETU.stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <p className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-[-0.035em] text-ink">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-[15px] text-ink-2">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mx-auto mt-16 max-w-[760px]">
          <p className="flex items-start justify-center gap-3 text-center text-[19px] text-ink-2">
            <Cpu className="mt-1 size-5 shrink-0 text-ayurveda" strokeWidth={1.75} aria-hidden="true" />
            {SETU.callout}
          </p>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
