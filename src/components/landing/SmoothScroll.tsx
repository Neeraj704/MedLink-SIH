"use client";

import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

const NAV_OFFSET = -72;

type ScrollTarget = string | HTMLElement | number;

type SmoothScrollApi = {
  scrollTo: (target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) => void;
  lock: () => () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

function resolve(target: ScrollTarget): HTMLElement | number | null {
  if (typeof target === "number") return target;
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  return target;
}

export function SmoothScroll({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;
    if (lockCount.current > 0) lenis.stop();
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  const scrollTo = useCallback<SmoothScrollApi["scrollTo"]>((target, opts) => {
    const el = resolve(target);
    if (el === null) return;
    const offset = opts?.offset ?? NAV_OFFSET;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(el, { offset, duration: 1.4, immediate: opts?.immediate, force: true });
      return;
    }
    const top = typeof el === "number" ? el : el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: opts?.immediate ? "auto" : "smooth" });
  }, []);

  const lock = useCallback(() => {
    lockCount.current += 1;
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    let released = false;
    return () => {
      if (released) return;
      released = true;
      lockCount.current = Math.max(0, lockCount.current - 1);
      if (lockCount.current === 0) {
        lenisRef.current?.start();
        document.documentElement.style.overflow = "";
      }
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const api = useMemo(() => ({ scrollTo, lock }), [scrollTo, lock]);
  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside SmoothScroll");
  return ctx;
}

/** Pauses Lenis and native scrolling while `active` is true. */
export function useScrollLock(active: boolean) {
  const { lock } = useSmoothScroll();
  useEffect(() => {
    if (!active) return;
    return lock();
  }, [active, lock]);
}
