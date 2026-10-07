"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASSISTANT_API, ASSISTANT_COPY, ASSISTANT_KB } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-context";
import { EASE_EXPO } from "./primitives";

type Msg = { id: number; role: "user" | "bot"; text: string };

function offlineAnswer(question: string): string {
  const q = question.toLowerCase();
  const words = q.split(/[^a-z0-9-]+/).filter((w) => w.length > 1);
  let best: { score: number; a: string } | null = null;
  for (const entry of ASSISTANT_KB) {
    let score = entry.q.toLowerCase() === q ? 100 : 0;
    for (const k of entry.keywords) {
      if (q.includes(k)) score += k.length > 3 ? 3 : 1;
    }
    for (const w of words) if (entry.q.toLowerCase().includes(w)) score += 0.5;
    if (!best || score > best.score) best = { score, a: entry.a };
  }
  return best && best.score >= 2 ? best.a : ASSISTANT_COPY.fallback;
}

async function ask(question: string): Promise<{ text: string; online: boolean }> {
  if (ASSISTANT_API) {
    try {
      const res = await fetch(`${ASSISTANT_API.replace(/\/$/, "")}/landing_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = (await res.json()) as { answer?: string; reply?: string; response?: string };
        const text = data.answer ?? data.reply ?? data.response;
        if (text) return { text, online: true };
      }
    } catch {
      /* fall through to offline answers */
    }
  }
  return { text: offlineAnswer(question), online: false };
}

export function Assistant() {
  const { reduceMotion, onboardingOpen, tourIndex } = useLanding();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(false);
  const idRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [msgs, busy, reduceMotion]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      setMsgs((m) => [...m, { id: ++idRef.current, role: "user", text: q }]);
      setBusy(true);
      const res = await ask(q);
      setOnline(res.online);
      setMsgs((m) => [...m, { id: ++idRef.current, role: "bot", text: res.text }]);
      setBusy(false);
    },
    [busy],
  );

  const hidden = onboardingOpen || tourIndex !== null;

  return (
    <>
      <AnimatePresence>
        {open && !hidden ? (
          <motion.section key="panel" aria-label={ASSISTANT_COPY.title} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.35, ease: EASE_EXPO }} className="glass fixed bottom-24 right-4 z-[80] flex h-[min(560px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[24px] sm:right-6" data-lenis-prevent>
            <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">{ASSISTANT_COPY.title}</h2>
                <p className="text-[12px] text-ink-3">{online ? "Live assistant" : ASSISTANT_COPY.offline}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 text-ink-2 hover:bg-canvas-alt hover:text-ink">
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite">
              {msgs.length === 0 ? (
                <div>
                  <p className="text-[14px] text-ink-2">Ask me about MedLink, NAMASTE, ICD-11, FHIR or data safety.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ASSISTANT_COPY.starters.map((s) => (
                      <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-hairline bg-canvas-alt px-3 py-1.5 text-[13px] text-ink hover:border-link">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {msgs.map((m) => (
                <div key={m.id} className={cn("max-w-[88%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed", m.role === "user" ? "ml-auto bg-btn text-white" : "bg-canvas-alt text-ink")}>
                  {m.text}
                </div>
              ))}
              {busy ? (
                <div className="w-fit rounded-2xl bg-canvas-alt px-4 py-3" aria-label="Assistant is typing">
                  <span className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className={cn("size-1.5 rounded-full bg-ink-3", !reduceMotion && "animate-pulse")} style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </span>
                </div>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-hairline p-3"
            >
              <div className="flex items-center gap-2 rounded-full border border-hairline bg-canvas-alt py-1 pl-4 pr-1 focus-within:border-link">
                <label htmlFor="assistant-input" className="sr-only">
                  Your question
                </label>
                <input
                  id="assistant-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
                  }}
                  placeholder="Ask a question…"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
                />
                <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="flex size-9 items-center justify-center rounded-full bg-btn text-white disabled:opacity-40">
                  <SendHorizontal className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-2 px-2 text-center text-[11px] text-ink-3">{ASSISTANT_COPY.disclaimer}</p>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {!hidden ? (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Close assistant" : "Open assistant"} className="fixed bottom-4 right-4 z-[80] flex size-14 items-center justify-center rounded-full bg-btn text-white shadow-long transition-transform hover:scale-105 active:scale-95 sm:right-6">
          {open ? <X className="size-6" aria-hidden="true" /> : <MessageCircle className="size-6" aria-hidden="true" />}
        </button>
      ) : null}
    </>
  );
}
