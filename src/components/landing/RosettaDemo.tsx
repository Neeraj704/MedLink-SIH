"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDashed, Search, ShieldCheck, UserCheck, X } from "lucide-react";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { ROSETTA, ROSETTA_COPY, SYSTEMS, type RosettaEntry, type SystemKey, type Translation } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Caption, ConfidenceRing, Container, EASE_EXPO, IconTile, MockWindow, SYSTEM_VARS, SectionHeader, SectionShell, StatusChip, Stagger, StaggerItem, TiltCard } from "./primitives";

const PRINCIPLE_ICONS = [ShieldCheck, UserCheck, CheckCircle2];

interface DiseaseRow {
  ICD11_Title: string;
  ICD11_Code: string;
  Ayurveda_NAMC_term: string;
  Siddha_NAMC_TERM: string;
  Unani_NUMC_TERM: string;
  Ayurveda_Similarity: string;
  Siddha_Similarity: string;
  Unani_Similarity: string;
}

function findSampleEntry(query: string): RosettaEntry | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  return ROSETTA.find((e) => e.keywords.some((k) => k.includes(q) || q.includes(k))) ?? null;
}

function translationFromRow(term?: string, similarity?: string): Translation {
  const normalized = term?.trim();
  if (!normalized) return { kind: "open" };
  const sim = Number.parseFloat(similarity ?? "");
  const confidence = Number.isFinite(sim) ? Math.max(0, Math.min(100, Math.round(sim * 100))) : 0;
  if (confidence > 0 && confidence < 40) return { kind: "low" };
  return { kind: "match", term: normalized, confidence };
}

function toLiveEntry(row: DiseaseRow): RosettaEntry {
  const title = row.ICD11_Title?.trim() || "Unknown condition";
  const code = row.ICD11_Code?.trim() || "N/A";
  return {
    id: `${code || title}-${row.Ayurveda_NAMC_term || ""}-${row.Siddha_NAMC_TERM || ""}-${row.Unani_NUMC_TERM || ""}`,
    chip: title,
    keywords: [title, code, row.Ayurveda_NAMC_term, row.Siddha_NAMC_TERM, row.Unani_NUMC_TERM]
      .filter(Boolean)
      .map((v) => v.toLowerCase()),
    icd: { title, code },
    results: {
      ayurveda: translationFromRow(row.Ayurveda_NAMC_term, row.Ayurveda_Similarity),
      siddha: translationFromRow(row.Siddha_NAMC_TERM, row.Siddha_Similarity),
      unani: translationFromRow(row.Unani_NUMC_TERM, row.Unani_Similarity),
    },
  };
}

function findLiveEntry(query: string, data: DiseaseRow[]): RosettaEntry | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  const matches = data.filter((row) => {
    const title = row.ICD11_Title?.toLowerCase() ?? "";
    const code = row.ICD11_Code?.toLowerCase() ?? "";
    const ayurveda = row.Ayurveda_NAMC_term?.toLowerCase() ?? "";
    const siddha = row.Siddha_NAMC_TERM?.toLowerCase() ?? "";
    const unani = row.Unani_NUMC_TERM?.toLowerCase() ?? "";
    return title.includes(q) || code.includes(q) || ayurveda.includes(q) || siddha.includes(q) || unani.includes(q);
  });
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const aTitle = a.ICD11_Title?.toLowerCase() ?? "";
    const bTitle = b.ICD11_Title?.toLowerCase() ?? "";
    const aCode = a.ICD11_Code?.toLowerCase() ?? "";
    const bCode = b.ICD11_Code?.toLowerCase() ?? "";
    const aExact = aTitle === q || aCode === q;
    const bExact = bTitle === q || bCode === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    const aStarts = aTitle.startsWith(q) || aCode.startsWith(q);
    const bStarts = bTitle.startsWith(q) || bCode.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return aTitle.localeCompare(bTitle);
  });
  return toLiveEntry(matches[0]);
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
      className="card-surface flex items-start justify-between gap-3 rounded-2xl p-4 sm:items-center sm:gap-4"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: v.text }}>
          <span className="size-1.5 rounded-full" style={{ background: v.fill }} aria-hidden="true" />
          {meta.label} <span className="font-normal normal-case tracking-normal text-ink-3">· {meta.vocab}</span>
        </p>
        {result.kind === "match" ? (
          <p className="mt-1 break-words text-[17px] font-semibold tracking-[-0.01em] text-ink sm:text-[19px]">{result.term}</p>
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
      {result.kind === "match" ? <ConfidenceRing value={result.confidence} color={v.fill} label={`${meta.label}: ${result.confidence}% confidence`} /> : null}
    </motion.li>
  );
}

export function RosettaDemo() {
  const [query, setQuery] = useState(ROSETTA[0].chip);
  const [liveData, setLiveData] = useState<DiseaseRow[]>([]);
  const [csvReady, setCsvReady] = useState(false);
  const entry = useMemo(() => (liveData.length ? findLiveEntry(query, liveData) : findSampleEntry(query)), [query, liveData]);
  const systems: Exclude<SystemKey, "icd">[] = ["ayurveda", "siddha", "unani"];
  const isLiveMode = csvReady && liveData.length > 0;

  useEffect(() => {
    Papa.parse("/conciseFinalData.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data as DiseaseRow[]).filter((row) => row?.ICD11_Title?.trim());
        setLiveData(rows);
        setCsvReady(true);
      },
      error: () => setCsvReady(true),
    });
  }, []);

  return (
    <SectionShell id="how" tone="light" tour="demo">
      <Container>
        <SectionHeader id="how" eyebrow={ROSETTA_COPY.eyebrow} title={ROSETTA_COPY.title} sub={ROSETTA_COPY.sub} />
        <div className="mx-auto mt-14 max-w-[880px]">
          <TiltCard max={4} className="rounded-[20px]">
            <MockWindow title="MedLink · Code Translation" actions={<StatusChip feature="translation" />} bodyClassName="p-4 sm:p-5 md:p-8">
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
                  className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3 sm:text-[17px]"
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
                    aria-pressed={query === e.chip}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[14px] transition-colors",
                      query === e.chip ? "border-link bg-[color-mix(in_oklab,var(--blue)_10%,transparent)] text-link" : "border-hairline text-ink-2 hover:text-ink",
                    )}
                  >
                    {e.chip}
                  </button>
                ))}
              </div>

              <div className="mt-8 min-h-[260px] sm:min-h-[340px]" aria-live="polite" id="rosetta-status">
                <AnimatePresence mode="wait">
                  {entry ? (
                    <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-btn px-5 py-4 text-white">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/75">WHO ICD-11</p>
                          <p className="break-words text-[20px] font-semibold tracking-[-0.015em] sm:text-[22px]">{entry.icd.title}</p>
                        </div>
                        <span className="t-mono shrink-0 rounded-full bg-white/15 px-3 py-1 text-white">{entry.icd.code}</span>
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
                      className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline px-4 text-center sm:min-h-[300px]"
                    >
                      <Search className="size-7 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
                      <p className="mt-3 text-[17px] text-ink-2">{query.trim() ? (isLiveMode ? "No matching diagnosis found." : "No sample match in this preview.") : "Type a diagnosis to begin."}</p>
                      <p className="mt-1 text-[14px] text-ink-3">{isLiveMode ? `Live preview searches ${liveData.length.toLocaleString()} mappings.` : ROSETTA_COPY.empty}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </MockWindow>
          </TiltCard>
          <Caption className="mt-4 text-center">{isLiveMode ? "Live CSV-backed preview from conciseFinalData.csv." : ROSETTA_COPY.caption}</Caption>
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
