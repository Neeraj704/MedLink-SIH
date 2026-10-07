"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  shake,
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  shake: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const controls = useAnimationControls();
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();

  useEffect(() => {
    focusAt(0);
  }, []);

  useEffect(() => {
    if (shake === 0) return;
    controls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.42 } });
    focusAt(0);
  }, [shake, controls]);

  const commit = (next: string) => {
    onChange(next);
    if (next.length === LENGTH) onComplete?.(next);
  };

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.replace(/\D/g, "");
    if (!typed) return;
    if (typed.length > 1) {
      const next = (value.slice(0, i) + typed).slice(0, LENGTH);
      commit(next);
      focusAt(next.length >= LENGTH ? LENGTH - 1 : next.length);
      return;
    }
    const next = (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, LENGTH);
    commit(next);
    focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) onChange(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    commit(pasted);
    focusAt(pasted.length >= LENGTH ? LENGTH - 1 : pasted.length);
  };

  return (
    <motion.div animate={controls} role="group" aria-label="One-time password" className="grid grid-cols-6 gap-2.5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
          aria-invalid={invalid ? true : undefined}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-14 w-full rounded-xl border bg-raised text-center text-[22px] font-semibold tabular-nums text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-link focus:ring-4 focus:ring-[color-mix(in_oklab,var(--blue)_22%,transparent)] disabled:opacity-60",
            invalid
              ? "border-danger"
              : d
                ? "border-link"
                : "border-[color-mix(in_oklab,var(--ink)_16%,transparent)]",
          )}
        />
      ))}
    </motion.div>
  );
}
