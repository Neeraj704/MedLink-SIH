"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { AUTH_ROUTE, HERO, LINKS, PROTOTYPE_TIP } from "@/lib/landing-data";
import { RosettaOrb } from "./RosettaOrb";
import { Caption, EASE_APPLE, EASE_EXPO, PrimaryLink, SYSTEM_VARS, SplitWords, Term, TextLink } from "./primitives";
import { usePersona } from "./usePersona";
import { useReducedMotionPref } from "./useReducedMotionPref";

const CHIP_POS = [
  { className: "left-[2%] top-[14%]", depth: 18 },
  { className: "right-[0%] top-[22%]", depth: -24 },
  { className: "bottom-[16%] left-[6%]", depth: 14 },
];

function OrbChip({
  system,
  term,
  label,
  className,
  depth,
  px,
  py,
  delay,
}: {
  system: "ayurveda" | "siddha" | "unani" | "icd";
  term: string;
  label: string;
  className: string;
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  delay: number;
}) {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth);
  const v = SYSTEM_VARS[system];
  return (
    <motion.div
      className={`glass absolute flex items-center gap-1.5 sm:gap-2 rounded-full py-1 pl-1.5 pr-2.5 sm:py-1.5 sm:pl-2 sm:pr-3.5 whitespace-nowrap shadow-sm ${className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE_EXPO, delay }}
    >
      <span className="size-2 sm:size-2.5 rounded-full" style={{ background: v.fill, boxShadow: `0 0 12px ${v.fill}` }} aria-hidden="true" />
      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: v.text }}>
        {label}
      </span>
      <span className="text-[12px] sm:text-[14px] font-medium text-ink">{term}</span>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { reduce } = useReducedMotionPref();
  const { config } = usePersona();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 80, damping: 20 });
  const py = useSpring(rawY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative flex flex-col justify-center overflow-hidden bg-canvas pt-24 pb-12 lg:h-[100svh] lg:min-h-[600px] lg:pt-16 lg:pb-8"
    >
      <div className="side-pad relative mx-auto grid w-full max-w-[1360px] items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-6">
        <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="relative z-10 text-center lg:text-left">
          <motion.p
            className="t-mono mb-5 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1 text-ink-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_APPLE }}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="ping-soft absolute inset-0 rounded-full bg-ayurveda" />
              <span className="relative size-2 rounded-full bg-ayurveda" />
            </span>
            {HERO.eyebrow}
          </motion.p>
          <h1 id="hero-title" className="t-display text-ink">
            <span className="block">
              <SplitWords text={HERO.lines[0]} delay={0.1} />
            </span>
            <span className="block">
              <SplitWords text={HERO.lines[1]} delay={0.3} wordClassName="text-gradient-vocab" />
            </span>
            <span className="block">
              <SplitWords text={HERO.lines[2]} delay={0.5} />
            </span>
          </h1>
          <motion.p
            className="t-sub mx-auto mt-5 max-w-[540px] lg:mx-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_APPLE, delay: 0.75 }}
          >
            MedLink translates <Term k="Ayush">Ayurveda, Siddha and Unani</Term> diagnoses into WHO <Term k="ICD-11" /> — in real time, inside the doctor&apos;s workflow.
          </motion.p>
          <motion.div
            className="mt-7 flex flex-col items-center gap-x-6 gap-y-4 sm:flex-row sm:justify-center lg:justify-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_APPLE, delay: 0.9 }}
          >
            <PrimaryLink href={AUTH_ROUTE}>
              Open the app
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </PrimaryLink>
            {config?.heroLink ? (
              <TextLink href={config.heroLink.href}>{config.heroLink.label}</TextLink>
            ) : (
              <TextLink href="#how">See how it works</TextLink>
            )}
            {LINKS.demo !== "#" ? (
              <a href={LINKS.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[17px] text-link">
                <Play className="size-4" strokeWidth={2} aria-hidden="true" />
                Watch demo
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.1 }} className="mt-7 space-y-1.5">
            <p className="text-[14px] text-ink-2">{HERO.rails}</p>
            <Caption>{PROTOTYPE_TIP}</Caption>
            <Caption>{HERO.notice}</Caption>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[min(480px,86vw)] sm:max-w-[min(560px,92vw)] lg:max-w-[min(560px,calc(100svh-8rem))]"
          style={reduce ? undefined : { scale: orbScale, y: orbY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE_APPLE }}
        >
          <RosettaOrb reduce={reduce} className="absolute inset-0 size-full" />
          {HERO.chips.map((c, i) => (
            <OrbChip key={c.term} system={c.system} term={c.term} label={c.label} className={CHIP_POS[i].className} depth={CHIP_POS[i].depth} px={px} py={py} delay={1.4 + i * 0.15} />
          ))}
          <motion.div
            className="absolute bottom-[2%] sm:bottom-[3%] left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EXPO, delay: 2 }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-btn py-1.5 pl-2.5 pr-3.5 sm:py-2 sm:pl-3 sm:pr-4 text-white shadow-long whitespace-nowrap">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-white/75">{HERO.core.label}</span>
              <span className="text-[13px] sm:text-[15px] font-semibold">{HERO.core.term}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <a href="#standards" className="nudge-down absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-ink-3 lg:block" aria-label="Scroll to content">
        <ChevronDown className="size-6" strokeWidth={1.5} />
      </a>
    </section>
  );
}
