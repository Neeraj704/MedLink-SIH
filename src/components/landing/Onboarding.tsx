"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GREETINGS, PERSONAS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { useLanding } from "./landing-context";
import { EASE_EXPO, btnPrimary, btnSecondary } from "./primitives";
import { useScrollLock } from "./SmoothScroll";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-btn" : "bg-hairline")}>
      <span className={cn("absolute top-0.5 size-6 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function Greetings({ reduceMotion }: { reduceMotion: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % GREETINGS.length), 1400);
    return () => window.clearInterval(id);
  }, [reduceMotion]);
  const g = GREETINGS[i];
  return (
    <div className="flex h-16 sm:h-24 items-center justify-center" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.span key={g.text} lang={g.lang} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -14 }} transition={{ duration: 0.45, ease: EASE_EXPO }} className="text-[clamp(1.75rem,5.5vw,3.5rem)] font-bold tracking-[-0.03em] text-ink">
          {g.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function Onboarding() {
  const { onboardingOpen, onboardingStep, setOnboardingStep, closeOnboarding, startTour, persona, setPersona, reduceMotion, setReduceMotion, smoothScroll, setSmoothScroll } = useLanding();
  const dialogRef = useRef<HTMLDivElement>(null);
  useScrollLock(onboardingOpen);

  useEffect(() => {
    if (!onboardingOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOnboarding();
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onboardingOpen, closeOnboarding]);

  useEffect(() => {
    if (!onboardingOpen) return;
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [onboardingOpen, onboardingStep]);

  const next = () => setOnboardingStep(Math.min(3, onboardingStep + 1) as 0 | 1 | 2 | 3);
  const back = () => setOnboardingStep(Math.max(0, onboardingStep - 1) as 0 | 1 | 2 | 3);

  return (
    <AnimatePresence>
      {onboardingOpen ? (
        <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 p-3 backdrop-blur-xl sm:p-4" data-lenis-prevent>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="glass relative max-h-[92dvh] w-full max-w-[640px] overflow-y-auto rounded-[24px] p-5 sm:rounded-[28px] sm:p-8 md:p-12 overscroll-contain">
            <button
              type="button"
              onClick={closeOnboarding}
              aria-label="Close onboarding"
              className="absolute right-3.5 top-3.5 z-10 rounded-full p-2 text-ink-3 transition-colors hover:bg-canvas-alt hover:text-ink sm:right-6 sm:top-6"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <ol className="mb-5 flex justify-center gap-2 sm:mb-8" aria-label={`Step ${onboardingStep + 1} of 4`}>
              {[0, 1, 2, 3].map((s) => (
                <li key={s} className={cn("h-1.5 rounded-full transition-all duration-500", s === onboardingStep ? "w-8 bg-link" : "w-1.5 bg-hairline")} />
              ))}
            </ol>

            {onboardingStep === 0 ? (
              <div className="text-center">
                <Greetings reduceMotion={reduceMotion} />
                <h2 id="onboarding-title" className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink sm:mt-4 sm:text-[26px]">
                  Welcome to MedLink
                </h2>
                <p className="mx-auto mt-2 max-w-[420px] text-[14px] text-ink-2 sm:mt-3 sm:text-[16px]">One diagnosis. Four vocabularies. A record every hospital can read.</p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8">
                  <button type="button" data-autofocus onClick={next} className={cn(btnPrimary, "w-full max-w-xs sm:w-auto")}>
                    Get started
                  </button>
                  <button type="button" onClick={closeOnboarding} className="text-[14px] text-ink-3 hover:text-ink py-1">
                    Skip
                  </button>
                </div>
              </div>
            ) : null}

            {onboardingStep === 1 ? (
              <div>
                <h2 id="onboarding-title" className="text-center text-[20px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
                  Who are you here as?
                </h2>
                <p className="mt-1.5 text-center text-[13px] text-ink-2 sm:mt-2 sm:text-[15px]">We&apos;ll highlight the sections that matter most to you.</p>
                <div role="radiogroup" aria-label="Choose your role" className="mt-5 grid gap-2.5 sm:mt-7 sm:gap-3 sm:grid-cols-2">
                  {PERSONAS.map((p, i) => {
                    const on = persona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        data-autofocus={i === 0 ? true : undefined}
                        onClick={() => setPersona(p.id)}
                        className={cn(
                          "relative rounded-2xl border p-3.5 text-left transition-all sm:rounded-[20px] sm:p-5",
                          on ? "border-link bg-raised shadow-long" : "border-hairline bg-canvas-alt hover:border-ink-3",
                        )}
                      >
                        {on ? <Check className="absolute right-3.5 top-3.5 size-4 text-link sm:right-4 sm:top-4" aria-hidden="true" /> : null}
                        <p className="pr-5 text-[15px] font-semibold text-ink sm:text-[16px]">{p.label}</p>
                        <p className="mt-0.5 text-[12px] leading-snug text-ink-2 sm:mt-1 sm:text-[13px]">{p.description}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 sm:mt-8">
                  <button type="button" onClick={back} className={btnSecondary}>
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={closeOnboarding} className="text-[13px] text-ink-3 hover:text-ink sm:text-[14px]">
                      Skip
                    </button>
                    <button type="button" onClick={next} disabled={!persona} className={cn(btnPrimary, "disabled:opacity-40")}>
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {onboardingStep === 2 ? (
              <div>
                <h2 id="onboarding-title" className="text-center text-[20px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
                  Make it comfortable
                </h2>
                <div className="mt-5 divide-y divide-hairline rounded-2xl border border-hairline bg-canvas-alt sm:mt-7 sm:rounded-[20px]">
                  <div className="flex items-center justify-between gap-4 p-3.5 sm:p-5">
                    <div>
                      <p className="text-[15px] font-medium text-ink sm:text-[16px]">Reduce motion</p>
                      <p className="text-[12px] text-ink-2 sm:text-[13px]">Calmer transitions, no looping animation.</p>
                    </div>
                    <Switch checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-3.5 sm:p-5">
                    <div>
                      <p className="text-[15px] font-medium text-ink sm:text-[16px]">Smooth scrolling</p>
                      <p className="text-[12px] text-ink-2 sm:text-[13px]">Eased page scrolling.</p>
                    </div>
                    <Switch checked={smoothScroll} onChange={setSmoothScroll} label="Smooth scrolling" />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 sm:mt-8">
                  <button type="button" onClick={back} className={btnSecondary}>
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={closeOnboarding} className="text-[13px] text-ink-3 hover:text-ink sm:text-[14px]">
                      Skip
                    </button>
                    <button type="button" data-autofocus onClick={next} className={btnPrimary}>
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {onboardingStep === 3 ? (
              <div className="text-center">
                <h2 id="onboarding-title" className="text-[20px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
                  Want a 30-second tour?
                </h2>
                <p className="mx-auto mt-2 max-w-[420px] text-[14px] text-ink-2 sm:mt-3 sm:text-[16px]">Five stops: the translator, the pipeline, FHIR, the assistant and the portals.</p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center">
                  <button type="button" data-autofocus onClick={startTour} className={cn(btnPrimary, "w-full max-w-xs sm:w-auto")}>
                    Take the tour
                  </button>
                  <button type="button" onClick={closeOnboarding} className={cn(btnSecondary, "w-full max-w-xs sm:w-auto")}>
                    I&apos;ll explore myself
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
