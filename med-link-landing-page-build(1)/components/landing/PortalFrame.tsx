"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Caption, EASE_EXPO, MockWindow, StatusChip } from "./primitives";
import { SAMPLE_CAPTION, type FeatureKey } from "@/lib/landing-data";

export function PortalFrame<T extends string>({
  idPrefix,
  title,
  tabs,
  active,
  onChange,
  feature,
  description,
  children,
}: {
  idPrefix: string;
  title: string;
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  feature: FeatureKey;
  description?: string;
  children: ReactNode;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <MockWindow title={title} actions={<StatusChip feature={feature} />} bodyClassName="grid md:grid-cols-[200px_1fr]">
        <div
          role="tablist"
          aria-label={`${title} sections`}
          aria-orientation="vertical"
          onKeyDown={onKey}
          className="no-scrollbar flex gap-1 overflow-x-auto border-b border-hairline bg-canvas-alt p-2 md:flex-col md:border-b-0 md:border-r md:p-3"
        >
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${idPrefix}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={active === t.id}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative shrink-0 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                active === t.id ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {active === t.id ? <motion.span layoutId={`${idPrefix}-tab-bg`} className="absolute inset-0 rounded-lg bg-raised shadow-sm" transition={{ type: "spring", stiffness: 380, damping: 34 }} /> : null}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <div id={`${idPrefix}-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${active}`} className="min-h-[460px] min-w-0 p-5 md:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE_EXPO }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </MockWindow>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Caption>{SAMPLE_CAPTION}</Caption>
        {description ? <p className="text-[13px] text-ink-2">{description}</p> : null}
      </div>
    </div>
  );
}

export function PanelTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">{children}</h3>
      {aside}
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas-alt p-4">
      <p className="text-[12px] text-ink-3">{label}</p>
      <p className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">{value}</p>
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-canvas-alt text-ink-2",
    green: "bg-[color-mix(in_oklab,var(--ayurveda)_14%,transparent)] text-ayurveda-text",
    amber: "bg-[color-mix(in_oklab,var(--siddha)_16%,transparent)] text-siddha-text",
    red: "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger",
    blue: "bg-[color-mix(in_oklab,var(--blue)_12%,transparent)] text-link",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium", tones[tone])}>{children}</span>;
}

export const inputCls = "w-full rounded-xl border border-hairline bg-canvas-alt px-3 py-2 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:border-link";
