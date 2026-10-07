"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { AlertTriangle, ArrowRight, Ban, Bot, Database, MessageSquare, RotateCcw, SendHorizontal, Shield, Thermometer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AI_COPY } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Caption, ConfidenceRing, Container, EASE_EXPO, IconTile, MockWindow, Reveal, SYSTEM_VARS, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip, Term } from "./primitives";
import { useReducedMotionPref } from "./useReducedMotionPref";

type Mode = (typeof AI_COPY.modes)[number]["id"];
type Msg = { role: "user" | "bot"; kind?: "table" | "refusal" | "abstain"; text?: string } | { role: "typing" };

const TRUST_ICONS = [Database, Thermometer, Shield, AlertTriangle];

function buildTimeline() {
  const steps: { msgs: Msg[]; wait: number }[] = [];
  const acc: Msg[] = [];
  for (const s of AI_COPY.script) {
    acc.push({ role: "user", text: s.user });
    steps.push({ msgs: [...acc], wait: 700 });
    steps.push({ msgs: [...acc, { role: "typing" }], wait: 1100 });
    acc.push({ role: "bot", kind: s.kind });
    steps.push({ msgs: [...acc], wait: 1900 });
  }
  return steps;
}
const TIMELINE = buildTimeline();

function TranslationTable({ mode }: { mode: Mode }) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-hairline">
        <table className="w-full text-left text-[14px]">
          <caption className="sr-only">Gastroenteritis across four vocabularies</caption>
          <thead className="bg-canvas-alt text-[12px] uppercase tracking-[0.05em] text-ink-3">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                System
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                Term
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody>
            {AI_COPY.table.map((r) => (
              <tr key={r.system} className="border-t border-hairline">
                <td className="px-3 py-2 font-medium" style={{ color: SYSTEM_VARS[r.key].text }}>
                  {r.system}
                </td>
                <td className="px-3 py-2 text-ink">{r.term}</td>
                <td className="px-3 py-1.5">
                  <span className="flex justify-end">
                    <ConfidenceRing value={r.confidence} color={SYSTEM_VARS[r.key].fill} size={32} label={`${r.confidence}%`} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={mode} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: EASE_EXPO }} className="overflow-hidden">
          {AI_COPY.modeText[mode].map((p) => (
            <p key={p} className="mt-3 text-[14px] leading-relaxed text-ink-2">
              {p}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Bubble({ msg, mode }: { msg: Msg; mode: Mode }) {
  if (msg.role === "typing") {
    return (
      <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md bg-canvas-alt px-4 py-3" aria-label="MedLink AI is typing">
        {[0, 1, 2].map((i) => (
          <span key={i} className="pulse-dot size-1.5 rounded-full bg-ink-3" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    );
  }
  if (msg.role === "user") {
    return <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-btn px-4 py-2.5 text-[15px] text-white">{msg.text}</div>;
  }
  return (
    <div className="flex max-w-[92%] gap-2.5 self-start">
      <span className="mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--blue)_14%,transparent)] text-link" aria-hidden="true">
        <Bot className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-hairline bg-raised px-4 py-3 text-[15px] text-ink">
        {msg.kind === "table" ? (
          <TranslationTable mode={mode} />
        ) : msg.kind === "refusal" ? (
          <p className="flex gap-2">
            <Ban className="mt-0.5 size-4 shrink-0 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
            {AI_COPY.refusal}
          </p>
        ) : (
          <p className="flex gap-2 text-siddha-text">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {AI_COPY.abstain}
          </p>
        )}
      </div>
    </div>
  );
}

function ScriptedChat() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const { reduce } = useReducedMotionPref();
  const [step, setStep] = useState(-1);
  const [run, setRun] = useState(0);
  const [mode, setMode] = useState<Mode>("default");

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setStep(TIMELINE.length - 1);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    setStep(0);
    const next = () => {
      i += 1;
      if (i >= TIMELINE.length) return;
      setStep(i);
      timer = setTimeout(next, TIMELINE[i].wait);
    };
    timer = setTimeout(next, TIMELINE[0].wait);
    return () => clearTimeout(timer);
  }, [inView, reduce, run]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [step, reduce]);

  const msgs = step >= 0 ? TIMELINE[step].msgs : [];
  const done = step === TIMELINE.length - 1;

  return (
    <div ref={ref}>
      <MockWindow title="MedLink AI" actions={<StatusChip feature="aiAssistant" />} bodyClassName="grid md:grid-cols-[200px_1fr]">
        <aside className="hidden border-r border-hairline bg-canvas-alt p-4 md:block" aria-label="Chat history (sample)">
          <p className="t-mono mb-3 text-ink-3">History</p>
          <ul className="space-y-1">
            {AI_COPY.history.map((h, i) => (
              <li key={h} className={cn("flex items-center gap-2 truncate rounded-lg px-2 py-1.5 text-[13px]", i === 0 ? "bg-raised text-ink" : "text-ink-2")}>
                <MessageSquare className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span className="truncate">{h}</span>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-2.5">
            <span className="text-[12px] text-ink-3" id="ai-mode-label">
              Response
            </span>
            <div role="radiogroup" aria-labelledby="ai-mode-label" className="no-scrollbar flex gap-1 overflow-x-auto">
              {AI_COPY.modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors", mode === m.id ? "bg-btn text-white" : "text-ink-2 hover:text-ink")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div ref={scrollRef} data-lenis-prevent className="no-scrollbar flex h-[440px] flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.length === 0 ? (
              <div className="m-auto text-center">
                <p className="text-[15px] text-ink-2">Try asking</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-2">
                  {AI_COPY.suggestions.map((s) => (
                    <li key={s} className="rounded-full border border-hairline px-3 py-1 text-[13px] text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              msgs.map((m, i) => (
                <motion.div key={`${run}-${i}-${m.role}`} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_EXPO }} className="flex flex-col">
                  <Bubble msg={m} mode={mode} />
                </motion.div>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-hairline px-4 py-3">
            <span className="flex-1 truncate rounded-full bg-canvas-alt px-4 py-2 text-[14px] text-ink-3">{AI_COPY.inputPlaceholder}</span>
            {done ? (
              <button type="button" onClick={() => setRun((r) => r + 1)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-link">
                <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" />
                Replay
              </button>
            ) : (
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-btn text-white" aria-hidden="true">
                <SendHorizontal className="size-4" strokeWidth={2} />
              </span>
            )}
          </div>
          <p className="border-t border-hairline px-4 py-2 text-center text-[11px] text-ink-3">{AI_COPY.footer}</p>
        </div>
      </MockWindow>
      <Caption className="mt-3 text-center">{AI_COPY.caption}</Caption>
    </div>
  );
}

export function AiSection() {
  return (
    <SectionShell id="ai" tone="grey" tour="ai">
      <Container wide>
        <SectionHeader id="ai" eyebrow={AI_COPY.eyebrow} eyebrowColor="var(--unani)" title={AI_COPY.title} sub={AI_COPY.sub} />
        <div className="mt-16 grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <ScriptedChat />
          </Reveal>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {AI_COPY.trust.map((t, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <StaggerItem key={t.title} className="card-surface flex gap-4 rounded-[22px] p-5">
                  <IconTile color="var(--unani)">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </IconTile>
                  <div>
                    <h3 className="text-[17px] font-semibold text-ink">{t.title}</h3>
                    <p className="mt-0.5 text-[15px] text-ink-2">{t.body}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
        <Reveal className="mt-16">
          <p className="mb-4 text-center text-[15px] text-ink-2">
            Under the hood — <Term k="RAG">retrieval-augmented</Term>, never free-form.
          </p>
          <ol className="flex flex-wrap items-center justify-center gap-2" aria-label="Assistant pipeline">
            {AI_COPY.hood.map((h, i) => (
              <li key={h} className="flex items-center gap-2">
                <span className="glass rounded-full px-4 py-1.5 text-[14px] font-medium text-ink">{h}</span>
                {i < AI_COPY.hood.length - 1 ? <ArrowRight className="size-4 text-ink-3" strokeWidth={1.5} aria-hidden="true" /> : null}
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
