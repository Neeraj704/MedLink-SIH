"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EASE_EXPO, btnPrimary, btnSecondary } from "@/components/landing/primitives";
import { DEMO_OTP, LINKS } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import type { AuthRole } from "./auth-config";
import { AuthButton } from "./fields";
import { OtpInput } from "./OtpInput";

const RESEND_SECONDS = 30;

const SUCCESS_COPY: Record<AuthRole, { signin: string; signup: string }> = {
  patient: {
    signin: "Your records, consent controls and translations are ready.",
    signup: "Your account is set up. Your records and consent controls are ready.",
  },
  doctor: {
    signin: "Your diagnosis workspace is ready.",
    signup: "Your account is set up. Your diagnosis workspace is ready.",
  },
};

export function VerifyStep({
  role,
  masked,
  mode,
  onBack,
}: {
  role: AuthRole;
  masked: string;
  mode: "signin" | "signup";
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "success">("idle");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [shake, setShake] = useState(0);
  const [resent, setResent] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = (code: string) => {
    if (status !== "idle" || code.length !== 6) return;
    setError("");
    setStatus("checking");
    timer.current = setTimeout(() => {
      if (code === DEMO_OTP) {
        setStatus("success");
        return;
      }
      setStatus("idle");
      setOtp("");
      setShake((n) => n + 1);
      setError(`That code didn't match. For this prototype, use ${DEMO_OTP}.`);
    }, 650);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    verify(otp);
  };

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setOtp("");
    setError("");
    setResent(true);
  };

  if (status === "success") {
    return (
      <div className="text-center" role="status">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-ayurveda text-white"
        >
          <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.15 }}
        >
          <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.025em] text-ink">You&apos;re verified</h1>
          <p className="mx-auto mt-2 max-w-[340px] text-[15px] text-ink-2">{SUCCESS_COPY[role][mode]}</p>
          <div className="mt-8 flex flex-col gap-3">
            <a href={LINKS.live} target="_blank" rel="noopener noreferrer" className={cn(btnPrimary, "h-12 text-[16px]")}>
              Open MedLink
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <Link href="/" className={cn(btnSecondary, "h-12 text-[16px]")}>
              Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 mb-6 inline-flex items-center gap-1.5 rounded-md px-1 text-[14px] text-ink-2 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back
      </button>
      <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">Enter the 6-digit code</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        We sent a code to the mobile linked to <span className="font-medium text-ink">{masked}</span>.
      </p>

      <div className="mt-8">
        <OtpInput value={otp} onChange={setOtp} onComplete={verify} invalid={!!error} disabled={status === "checking"} shake={shake} />
        <div aria-live="polite" className="min-h-[22px] pt-2.5 text-[13px]">
          {error ? (
            <p role="alert" className="text-danger">
              {error}
            </p>
          ) : resent ? (
            <p className="text-ink-3">A new code is on its way.</p>
          ) : null}
        </div>
      </div>

      <AuthButton type="submit" loading={status === "checking"} disabled={otp.length !== 6} className="mt-4">
        {status === "checking" ? "Verifying" : "Verify and continue"}
      </AuthButton>

      <div className="mt-5 flex items-center justify-between text-[14px]">
        {seconds > 0 ? (
          <span className="text-ink-3">
            Resend code in <span className="tabular-nums">{seconds}s</span>
          </span>
        ) : (
          <button type="button" onClick={resend} className="font-medium text-link hover:underline">
            Resend code
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setOtp(DEMO_OTP);
            verify(DEMO_OTP);
          }}
          className="rounded-full border border-hairline bg-canvas-alt px-3 py-1 text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          Demo OTP <span className="font-mono text-ink">{DEMO_OTP}</span> · Autofill
        </button>
      </div>
    </form>
  );
}
