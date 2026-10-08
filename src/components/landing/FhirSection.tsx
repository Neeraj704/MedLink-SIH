"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FHIR_COPY, FHIR_JSON, FHIR_SHEETS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Caption, Container, EASE_EXPO, MockWindow, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip, Term } from "./primitives";
import { useLanding } from "./landing-context";

const LINES = FHIR_JSON.split("\n");

function rangeFor(resource: string): [number, number] {
  const start = LINES.findIndex((l) => l.includes(`"resourceType": "${resource}"`));
  if (start < 0) return [-1, -1];
  let end = start;
  for (let i = start + 1; i < LINES.length; i++) {
    if (LINES[i].includes('"resourceType"') || LINES[i].trim().startsWith("]")) break;
    end = i;
  }
  return [start, end];
}

function highlight(line: string) {
  const parts = line.split(/("(?:[^"\\]|\\.)*"\s*:?)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^".*"\s*:$/.test(p)) return <span key={i} className="text-[var(--unani-text)]">{p}</span>;
    if (/^".*"$/.test(p)) return <span key={i} className="text-[var(--ayurveda-text)]">{p}</span>;
    return (
      <span key={i} className="text-ink-2">
        {p}
      </span>
    );
  });
}

export function FhirSection() {
  const { fhirFocus, setFhirFocus } = useLanding();
  const [active, setActive] = useState<string>("Condition");
  const [copied, setCopied] = useState(false);
  const [start, end] = useMemo(() => rangeFor(active), [active]);
  const sheet = FHIR_SHEETS.find((s) => s.id === active) ?? FHIR_SHEETS[0];

  useEffect(() => {
    if (!fhirFocus) return;
    setActive(fhirFocus);
    setFhirFocus(null);
  }, [fhirFocus, setFhirFocus]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FHIR_JSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <SectionShell id="fhir" tone="light" tour="fhir">
      <Container wide>
        <SectionHeader id="fhir" eyebrow={FHIR_COPY.eyebrow} title={FHIR_COPY.title} sub={FHIR_COPY.sub} />
        <p className="mt-4 text-center text-[15px] text-ink-3">
          A validated <Term k="HL7 FHIR R4" /> transaction Bundle.
        </p>

        <div className="mt-10 hidden gap-6 sm:mt-16 sm:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal>
            <div role="tablist" aria-label="FHIR resources" aria-orientation="vertical" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {FHIR_SHEETS.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={active === s.id}
                  aria-controls="fhir-detail"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "min-w-0 overflow-hidden rounded-2xl border p-2.5 text-left transition-[border-color,background-color] duration-300 sm:p-4",
                    active === s.id ? "border-link bg-[color-mix(in_oklab,var(--blue)_8%,var(--bg-raised))]" : "card-surface hover:border-ink-3/40",
                  )}
                >
                  <p className={cn("t-mono truncate text-[11.5px] sm:text-[13px]", active === s.id ? "text-link" : "text-ink-3")}>{s.id}</p>
                  <p className="mt-1 truncate text-[12.5px] font-medium leading-snug text-ink sm:text-[15px]">{s.body}</p>
                </button>
              ))}
            </div>
            <div id="fhir-detail" role="tabpanel" aria-live="polite" className="card-surface mt-3.5 rounded-[20px] p-4 sm:mt-4 sm:rounded-[24px] sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div key={sheet.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE_EXPO }}>
                  <h3 className="t-h3 text-ink">{sheet.title}</h3>
                  <ul className="mt-3.5 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                    {sheet.items.map((it) => (
                      <li key={it} className="rounded-full border border-hairline px-2.5 py-1 text-[12.5px] text-ink-2 sm:px-3 sm:text-[14px]">
                        {it}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <MockWindow
              title="bundle.json"
              actions={
                <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] text-link" aria-live="polite">
                  {copied ? <Check className="size-3.5" strokeWidth={2} aria-hidden="true" /> : <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              }
            >
              <pre className="no-scrollbar max-h-[340px] overflow-auto py-3 text-[11px] leading-[1.65] sm:max-h-[520px] sm:py-4 sm:text-[12.5px] sm:leading-[1.7]" data-lenis-prevent tabIndex={0} aria-label="Sample FHIR R4 Bundle JSON">
                <code className="block font-mono">
                  {LINES.map((line, i) => {
                    const on = i >= start && i <= end;
                    return (
                      <span
                        key={i}
                        className={cn("block whitespace-pre px-3.5 transition-[background-color,opacity] duration-300 sm:px-5", on ? "bg-[color-mix(in_oklab,var(--blue)_10%,transparent)]" : start >= 0 && "opacity-55")}
                        style={on ? { boxShadow: "inset 2px 0 0 var(--blue)" } : undefined}
                      >
                        {highlight(line)}
                      </span>
                    );
                  })}
                </code>
              </pre>
            </MockWindow>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <Caption>{FHIR_COPY.caption}</Caption>
              <StatusChip feature="fhirBundle" />
            </div>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid gap-3 sm:mt-16 sm:gap-4 md:grid-cols-3">
          {FHIR_COPY.stats.map((s) => (
            <StaggerItem key={s.label} className="card-surface rounded-[20px] p-5 sm:rounded-[28px] sm:p-8">
              <p className="text-[clamp(2rem,5vw,3.75rem)] font-bold tracking-[-0.035em] text-ink">{s.value}</p>
              <p className="t-body mt-1 text-[14px] sm:text-[15px]">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
          <span className="text-[14px] text-ink-2 sm:text-[15px]">Published to</span>
          {FHIR_COPY.destinations.map((d) => (
            <span key={d} className="glass rounded-full px-3 py-1 text-[13px] font-medium text-ink sm:px-4 sm:py-1.5 sm:text-[14px]">
              {d}
            </span>
          ))}
        </Reveal>
      </Container>
    </SectionShell>
  );
}
