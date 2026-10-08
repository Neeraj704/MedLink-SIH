"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SIGNIN_ROUTE, SIGNUP_ROUTE } from "@/lib/landing-data";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanding } from "./landing-context";
import { Logo } from "./Logo";
import { usePersona } from "./usePersona";
import { useScrollLock } from "./SmoothScroll";
import { EASE_APPLE, btnPrimary } from "./primitives";

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn("relative inline-flex size-8 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35, ease: EASE_APPLE }}
          className="inline-flex"
        >
          {isDark ? <Moon className="size-[18px]" strokeWidth={1.75} /> : <Sun className="size-[18px]" strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.4 });
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { openOnboarding } = useLanding();
  const { config } = usePersona();
  useScrollLock(menuOpen);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 8));

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.id).concat("patients");
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "patients" ? "doctors" : entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "glass rounded-none border-x-0 border-t-0 shadow-none transition-[height,border-color] duration-300",
          scrolled ? "h-12 border-b-hairline" : "h-14 border-b-transparent",
        )}
      >
        <nav aria-label="Primary" className="side-pad mx-auto flex h-full max-w-[1360px] items-center justify-between gap-4">
          <a href="#top" className="shrink-0 rounded-lg" aria-label="MedLink — back to top">
            <Logo />
          </a>
          <ul className="hidden items-center gap-5 xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={active === l.id ? "true" : undefined}
                  className={cn("text-[12.5px] transition-colors hover:text-ink", active === l.id ? "text-ink" : "text-ink-2")}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {config ? (
              <button
                type="button"
                onClick={() => openOnboarding(1)}
                className="glass hidden items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium text-ink-2 hover:text-ink md:inline-flex"
              >
                Viewing as {config.short}
                <ChevronDown className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
            ) : null}
            <ThemeToggle className="hidden sm:inline-flex" />
            <Link href={SIGNIN_ROUTE} className="hidden px-2 text-[13px] text-ink-2 hover:text-ink sm:inline">
              Sign in
            </Link>
            <Link href={SIGNUP_ROUTE} className={cn(btnPrimary, "hidden px-3.5 py-1.5 text-[13px] md:inline-flex")}>
              Get started
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full text-ink xl:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </div>
      <motion.div aria-hidden="true" className="h-[2px] origin-left bg-link" style={{ scaleX: progress }} />

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="glass fixed inset-0 z-[60] flex flex-col rounded-none border-0 px-8 pb-10 pt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_APPLE }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="inline-flex size-10 items-center justify-center rounded-full text-ink" autoFocus>
                <X className="size-6" strokeWidth={1.75} />
              </button>
            </div>
            <ul className="mt-10 flex flex-1 flex-col gap-3 overflow-y-auto" data-lenis-prevent>
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.045, duration: 0.5, ease: EASE_APPLE }}>
                  <a href={`#${l.id}`} onClick={() => setMenuOpen(false)} className="block text-[28px] font-semibold tracking-[-0.025em] text-ink">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between gap-4">
              <ThemeToggle className="size-11 border border-hairline" />
              <Link href={SIGNUP_ROUTE} className={cn(btnPrimary, "flex-1")}>
                Get started
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
