"use client";

import { motion } from "framer-motion";
import { Eye, FileCheck2, Fingerprint, Link2, Lock, ShieldCheck, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { TRUST } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, IconTile, Reveal, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip } from "./primitives";

const ACTIONS = ["Patient consent granted", "Record viewed by Dr. Rao", "Diagnosis coded", "FHIR bundle signed", "Record shared with hospital"];

function fnv(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function chain(tampered: number | null) {
  let prev = "00000000";
  return ACTIONS.map((a, i) => {
    prev = fnv(prev + a + (tampered === i ? "!edited" : ""));
    return prev;
  });
}

function AuditChain() {
  const [tampered, setTampered] = useState<number | null>(null);
  const original = useMemo(() => chain(null), []);
  const current = useMemo(() => chain(tampered), [tampered]);
  return (
    <div>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-stretch" aria-label="Audit chain">
        {ACTIONS.map((a, i) => {
          const broken = current[i] !== original[i];
          return (
            <li key={a} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-stretch">
              <button
                type="button"
                aria-pressed={tampered === i}
                onClick={() => setTampered(tampered === i ? null : i)}
                className={cn(
                  "flex-1 rounded-2xl border p-3 text-left transition-colors",
                  broken ? "border-danger bg-danger/10" : "border-hairline bg-canvas-alt hover:bg-raised",
                )}
              >
                <span className="block text-[12px] text-ink-3">Block {i + 1}</span>
                <span className="mt-1 block text-[13px] font-medium text-ink">{a}</span>
                <span className="t-mono mt-2 block truncate text-[11px] text-ink-2">{current[i]}</span>
                <span className={cn("mt-1 block text-[12px] font-medium", broken ? "text-danger" : "text-ayurveda-text")}>{broken ? "Hash mismatch" : "Valid"}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[13px] text-ink-2" aria-live="polite">
        {tampered === null ? "Select a block to simulate tampering." : `Block ${tampered + 1} was edited — every block after it no longer verifies.`}
      </p>
    </div>
  );
}

const ICONS: Record<string, LucideIcon> = { consent: Fingerprint, encryption: Lock, rls: ShieldCheck, audit: Link2, human: FileCheck2, deid: Eye };

export function TrustSafety() {
  const cards = Object.entries(TRUST.cards) as [keyof typeof TRUST.cards, (typeof TRUST.cards)[keyof typeof TRUST.cards]][];
  return (
    <SectionShell id="trust" tone="dark">
      <Container>
        <SectionHeader id="trust" eyebrow={TRUST.eyebrow} title={TRUST.title} sub={TRUST.sub} />
        <Stagger className="mt-12 sm:mt-16 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(([key, c]) => {
            const Icon = ICONS[key];
            const feature = "feature" in c ? c.feature : undefined;
            return (
              <StaggerItem key={key} className={cn("glass rounded-[20px] p-5 sm:rounded-[24px] sm:p-7", key === "audit" && "md:col-span-2 lg:col-span-3")}>
                <div className="flex items-start justify-between gap-3">
                  <IconTile>
                    <Icon className="size-5" strokeWidth={1.75} />
                  </IconTile>
                  {feature ? <StatusChip feature={feature} /> : null}
                </div>
                <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.015em] text-ink">{c.title}</h3>
                <p className="mt-2 max-w-[640px] text-[15px] text-ink-2">{c.body}</p>
                {key === "audit" ? (
                  <div className="mt-6">
                    <AuditChain />
                  </div>
                ) : null}
              </StaggerItem>
            );
          })}
        </Stagger>
        <Reveal className="mt-10">
          <ul className="flex flex-wrap justify-center gap-2">
            {TRUST.strip.map((s) => (
              <motion.li key={s} className="rounded-full border border-hairline px-4 py-1.5 text-[13px] text-ink-2">
                {s}
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
