"use client";

import { animate, motion, useInView, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import Link from "@/components/Link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { GLOSSARY, STATUS, STATUS_LABEL, type FeatureKey, type Status, type SystemKey } from "@/lib/landing-data";
import { usePersona } from "./usePersona";
import { useTilt } from "./useTilt";
import { useReducedMotionPref } from "./useReducedMotionPref";

export const EASE_APPLE = [0.28, 0.11, 0.32, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const SPRING = { type: "spring", stiffness: 170, damping: 26, mass: 0.9 } as const;
const VIEWPORT = { once: true, margin: "-12% 0px" } as const;

/* ---------------------------------------------------------------- */
/* Reveal / Stagger / SplitWords                                      */
/* ---------------------------------------------------------------- */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "li" | "span" | "h2" | "h3";
  y?: number;
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE_APPLE, delay }}
    >
      {children}
    </Comp>
  );
}

export function Stagger({ children, className, gap = 0.075, as = "div" }: { children: ReactNode; className?: string; gap?: number; as?: "div" | "ul" | "ol" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} initial="hidden" whileInView="show" viewport={VIEWPORT} variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </Comp>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_APPLE } },
};

export function StaggerItem({ children, className, as = "div", ...rest }: { children: ReactNode; className?: string; as?: "div" | "li" } & Omit<HTMLMotionProps<"div">, "children">) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} variants={staggerItem} {...rest}>
      {children}
    </Comp>
  );
}

export function SplitWords({ text, className, delay = 0, wordClassName }: { text: string; className?: string; delay?: number; wordClassName?: string }) {
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden="true">
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "105%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE_EXPO, delay: delay + i * 0.07 }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Surfaces                                                           */
/* ---------------------------------------------------------------- */
export function Glass({ children, className, as: Comp = "div", style }: { children: ReactNode; className?: string; as?: ElementType; style?: CSSProperties }) {
  return (
    <Comp className={cn("glass rounded-[28px]", className)} style={style}>
      {children}
    </Comp>
  );
}

export type Tone = "light" | "grey" | "white" | "dark";
const TONE: Record<Tone, string> = {
  light: "bg-canvas",
  grey: "bg-canvas-alt",
  white: "bg-raised",
  dark: "bg-canvas",
};

export function SectionShell({
  id,
  tone,
  children,
  className,
  labelledBy,
  tour,
  pad = true,
}: {
  id: string;
  tone: Tone;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  tour?: string;
  pad?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy ?? `${id}-title`} data-tour={tour} className={cn("relative scroll-mt-16", TONE[tone], pad && "section-pad", className)}>
      {children}
    </section>
  );
}

export function Container({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn("side-pad mx-auto w-full", wide ? "max-w-[1360px]" : "max-w-[1120px]", className)}>{children}</div>;
}

export function Eyebrow({ children, color = "var(--blue)", className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <p className={cn("t-eyebrow mb-4", className)} style={{ color }}>
      {children}
    </p>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  eyebrowColor,
  title,
  sub,
  align = "center",
  className,
}: {
  id: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-[920px] text-center" : "max-w-[820px]", className)}>
      <RecommendedRibbon sectionId={id} align={align} />
      {eyebrow ? (
        <Reveal>
          <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal>
        <h2 id={`${id}-title`} className="t-h2 text-ink">
          {title}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={0.08}>
          <p className={cn("t-sub mt-6", align === "center" && "mx-auto max-w-[760px]")}>{sub}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

export function RecommendedRibbon({ sectionId, align = "center" }: { sectionId: string; align?: "center" | "left" }) {
  const { isRecommended } = usePersona();
  if (!isRecommended(sectionId)) return null;
  return (
    <div className={cn("mb-5 flex", align === "center" ? "justify-center" : "justify-start")}>
      <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium text-link">
        <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Recommended for you
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Chips                                                              */
/* ---------------------------------------------------------------- */
export function StatusChip({ feature, status: statusProp, label, className }: { feature?: FeatureKey; status?: Status; label?: string; className?: string }) {
  const status: Status = statusProp ?? (feature ? STATUS[feature] : "live");
  const isLive = status === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-5",
        isLive ? "bg-[color-mix(in_oklab,var(--ayurveda)_14%,transparent)] text-ayurveda-text" : "border border-dashed border-ink-3/60 text-ink-2",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", isLive ? "bg-ayurveda" : "border border-ink-3")} />
      {label ? <span className="sr-only">{label}: </span> : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

export const SYSTEM_VARS: Record<SystemKey, { fill: string; text: string }> = {
  icd: { fill: "var(--icd)", text: "var(--icd-text)" },
  ayurveda: { fill: "var(--ayurveda)", text: "var(--ayurveda-text)" },
  siddha: { fill: "var(--siddha)", text: "var(--siddha-text)" },
  unani: { fill: "var(--unani)", text: "var(--unani-text)" },
};

export function SystemTag({ system, label, className }: { system: SystemKey; label: string; className?: string }) {
  const v = SYSTEM_VARS[system];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold", className)}
      style={{ color: v.text, background: `color-mix(in oklab, ${v.fill} 14%, transparent)` }}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: v.fill }} />
      {label}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Glossary term tooltip                                              */
/* ---------------------------------------------------------------- */
export function Term({ k, children, className }: { k: string; children?: ReactNode; className?: string }) {
  const entry = GLOSSARY[k];
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!entry) return <>{children ?? k}</>;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  };
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={cn("cursor-help underline decoration-dotted decoration-1 underline-offset-[3px]", className)}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        {children ?? entry.term}
      </button>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className="glass pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 w-[min(280px,80vw)] -translate-x-1/2 rounded-2xl px-4 py-3 text-left text-[13px] font-normal leading-snug tracking-normal text-ink normal-case"
        >
          <span className="mb-1 block font-semibold">{entry.term}</span>
          <span className="block text-ink-2">{entry.meaning}</span>
        </span>
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Buttons & links                                                    */
/* ---------------------------------------------------------------- */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const { reduce } = useReducedMotionPref();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  return (
    <motion.span
      className={cn("inline-flex", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 sm:px-[22px] sm:py-3 text-[15px] sm:text-[17px] font-medium leading-none transition-[background-color,transform,color] duration-200 active:scale-[.98] select-none";
export const btnPrimary = cn(BTN_BASE, "bg-btn text-white hover:bg-btn-hover");
export const btnSecondary = cn(BTN_BASE, "border border-hairline bg-canvas-alt text-ink hover:bg-[color-mix(in_oklab,var(--bg-alt)_80%,var(--ink)_8%)]");

export function PrimaryLink({ href, children, className, magnetic = true }: { href: string; children: ReactNode; className?: string; magnetic?: boolean }) {
  const link = (
    <Link href={href} className={cn(btnPrimary, className)}>
      {children}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}

export function TextLink({ href, children, className, external }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-px transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden="true" />
    </>
  );
  const cls = cn("group inline-flex items-center gap-0.5 text-[17px] font-normal text-link", className);
  if (external)
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {inner}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  if (href.startsWith("#"))
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/* ---------------------------------------------------------------- */
/* Tilt card & mock window                                            */
/* ---------------------------------------------------------------- */
export function TiltCard({ children, className, max = 8, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const tilt = useTilt(max);
  return (
    <motion.div className={cn("relative [transform-style:preserve-3d]", className)} style={{ ...style, ...tilt.style }} {...tilt.handlers}>
      {children}
      {tilt.enabled ? <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light" style={{ background: tilt.glare }} /> : null}
    </motion.div>
  );
}

export function MockWindow({
  title,
  children,
  className,
  bodyClassName,
  actions,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[20px] border border-hairline bg-raised shadow-long", className)}>
      <div className="glass flex h-11 items-center gap-3 rounded-none border-x-0 border-t-0 px-4 shadow-none">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <p className="flex-1 truncate text-center text-[13px] font-medium text-ink-2">{title}</p>
        <div className="flex min-w-[54px] justify-end">{actions}</div>
      </div>
      <div className={cn("relative", bodyClassName)}>{children}</div>
    </div>
  );
}

export function Caption({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[12px] leading-5 text-ink-3", className)}>{children}</p>;
}

/* ---------------------------------------------------------------- */
/* Counter                                                            */
/* ---------------------------------------------------------------- */
export function Counter({ value, prefix = "", suffix = "", className, duration = 1.8 }: { value: number; prefix?: string; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { reduce } = useReducedMotionPref();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, { duration, ease: EASE_EXPO, onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <span aria-hidden="true">
        {prefix}
        {display.toLocaleString("en-US")}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {value.toLocaleString("en-US")}
        {suffix}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Confidence ring                                                    */
/* ---------------------------------------------------------------- */
export function ConfidenceRing({ value, color, size = 44, label }: { value: number; color: string; size?: number; label?: string }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${value}% confidence`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth={4} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.1, ease: EASE_EXPO, delay: 0.15 }}
        />
      </svg>
      <span className="absolute text-[11px] font-semibold tabular-nums text-ink" aria-hidden="true">
        {value}
      </span>
    </span>
  );
}

export function IconTile({ children, color = "var(--blue)", className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-[14px]", className)}
      style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
