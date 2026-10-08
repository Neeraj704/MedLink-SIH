"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ARCH, STATUS_LABEL } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-context";
import { Container, EASE_EXPO, Eyebrow, SectionHeader, SectionShell } from "./primitives";

export function Architecture() {
  const { reduceMotion } = useLanding();
  const [liveOnly, setLiveOnly] = useState(false);
  const [openLayer, setOpenLayer] = useState<string | null>(null);

  return (
    <SectionShell id="architecture" tone="grey">
      <Container wide>
        <SectionHeader id="architecture" eyebrow={ARCH.eyebrow} title={ARCH.title} sub={ARCH.sub} />

        <div className="mx-auto mt-10 flex max-w-[1080px] flex-wrap items-center justify-between gap-4">
          <ul className="flex items-center gap-5 text-[13px] text-ink-2" aria-label="Legend">
            <li className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-ayurveda" aria-hidden="true" /> {STATUS_LABEL.live}
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2.5 rounded-full border border-dashed border-ink-3" aria-hidden="true" /> {STATUS_LABEL.roadmap}
            </li>
          </ul>
          <label className="inline-flex cursor-pointer items-center gap-3 text-[14px] text-ink">
            <span>Highlight live only</span>
            <button type="button" role="switch" aria-checked={liveOnly} onClick={() => setLiveOnly((v) => !v)} className={cn("relative h-6 w-10 rounded-full transition-colors", liveOnly ? "bg-btn" : "bg-hairline")}>
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", liveOnly ? "left-[18px]" : "left-0.5")} />
              <span className="sr-only">Highlight live components only</span>
            </button>
          </label>
        </div>

        <div className="mx-auto mt-8 max-w-[1080px] space-y-3 lg:[perspective:1600px]">
          {ARCH.layers.map((layer, li) => {
            const isOpen = openLayer === layer.name;
            return (
              <motion.div
                key={layer.name}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: li * 0.06, ease: EASE_EXPO }}
                className="relative lg:[transform:rotateX(14deg)] lg:[transform-origin:center_top] lg:[margin-inline:var(--layer-offset)]"
                style={{ ["--layer-offset" as string]: `${li * 6}px` }}
              >
                <div className="glass rounded-[20px] p-4 sm:rounded-[24px] sm:p-5 md:p-6">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenLayer(isOpen ? null : layer.name)}
                    className="flex w-full flex-wrap items-baseline justify-between gap-2 text-left"
                  >
                    <span className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                      <span className="t-mono mr-3 text-ink-3">{String(li + 1).padStart(2, "0")}</span>
                      {layer.name}
                    </span>
                    {layer.note ? <span className="text-[13px] text-ink-2">{layer.note}</span> : null}
                  </button>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {layer.items.map((it) => {
                      const dim = liveOnly && it.status === "roadmap";
                      return (
                        <li
                          key={it.label}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-opacity duration-300",
                            it.status === "live" ? "border-hairline bg-raised text-ink" : "border-dashed border-ink-3/60 text-ink-2",
                            dim && "opacity-30",
                          )}
                        >
                          <span className={cn("size-2 rounded-full", it.status === "live" ? "bg-ayurveda" : "border border-ink-3")} aria-hidden="true" />
                          {it.label}
                          <span className="sr-only"> — {STATUS_LABEL[it.status]}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {isOpen ? (
                    <p className="mt-4 text-[13px] text-ink-2">
                      {layer.items.filter((i) => i.status === "live").length} live · {layer.items.filter((i) => i.status === "roadmap").length} on the roadmap
                    </p>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mx-auto mt-6 grid max-w-[1080px] gap-3 sm:grid-cols-2">
          {ARCH.rails.map((r) => (
            <div key={r.name} className="rounded-[20px] border border-dashed border-ink-3/50 p-5">
              <p className="text-[14px] font-medium text-ink">{r.name} rail</p>
              <p className="mt-1 text-[13px] text-ink-2">{r.items.join(" · ")}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[1080px]">
          <Eyebrow className="text-center">Tech stack</Eyebrow>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARCH.stack.map((g) => (
              <div key={g.group} className="card-surface rounded-[20px] p-5">
                <p className="text-[13px] font-medium text-ink-3">{g.group}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {g.items.map((i) => (
                    <li key={i} className="rounded-full bg-canvas-alt px-2.5 py-1 text-[13px] text-ink">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
