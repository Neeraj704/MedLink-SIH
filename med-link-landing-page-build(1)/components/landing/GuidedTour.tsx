"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { TOUR_STOPS } from "@/lib/landing-data";
import { useLanding } from "./landing-context";
import { EASE_EXPO, btnPrimary } from "./primitives";
import { useSmoothScroll } from "./SmoothScroll";

export function GuidedTour() {
  const { tourIndex, setTourIndex } = useLanding();
  const { scrollTo } = useSmoothScroll();
  const stop = tourIndex === null ? null : TOUR_STOPS[tourIndex];

  useEffect(() => {
    if (!stop) return;
    scrollTo(`[data-tour="${stop.target}"]`);
  }, [stop, scrollTo]);

  useEffect(() => {
    if (tourIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTourIndex(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tourIndex, setTourIndex]);

  const last = tourIndex === TOUR_STOPS.length - 1;

  return (
    <AnimatePresence>
      {stop && tourIndex !== null ? (
        <motion.div key="tour" role="dialog" aria-label="Guided tour" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.5, ease: EASE_EXPO }} className="glass fixed inset-x-4 bottom-4 z-[90] mx-auto flex max-w-[640px] flex-col gap-4 rounded-[24px] p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="t-mono text-[12px] text-ink-3">
              {tourIndex + 1} / {TOUR_STOPS.length}
            </p>
            <p aria-live="polite" className="mt-1 text-[16px] font-medium text-ink">
              {stop.caption}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setTourIndex(null)} className="px-3 py-2 text-[14px] text-ink-3 hover:text-ink">
              Skip
            </button>
            {tourIndex > 0 ? (
              <button type="button" onClick={() => setTourIndex(tourIndex - 1)} className="px-3 py-2 text-[14px] text-ink-2 hover:text-ink">
                Back
              </button>
            ) : null}
            <button type="button" onClick={() => setTourIndex(last ? null : tourIndex + 1)} className={`${btnPrimary} !px-5 !py-2.5 !text-[15px]`}>
              {last ? "Done" : "Next"}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
