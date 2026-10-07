"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import Link from "@/components/Link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { DEMO_OTP, SIGNUP_ROUTE } from "@/lib/landing-data";
import { useAuth } from "@/contexts/AuthContext";
import {
  ROLE_CONFIG,
  detectIdentifier,
  maskId,
  validateIdentifier,
  type AuthRole,
} from "./auth-config";
import { AuthButton, RoleToggle, TextField } from "./fields";
import { VerifyStep } from "./VerifyStep";

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.28, 0.11, 0.32, 1] as const },
};

export function SignInForm({ initialRole }: { initialRole: AuthRole }) {
  const { login } = useAuth();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const detection = useMemo(() => detectIdentifier(role, identifier), [role, identifier]);

  const handleIdentifierChange = (val: string) => {
    // If user is typing digits or standard identifier, apply auto-format
    if (/^\d[\d\s-]*$/.test(val)) {
      const parsed = detectIdentifier(role, val);
      setIdentifier(parsed.formatted || val);
    } else if (role === "doctor" && /^[a-zA-Z]/i.test(val) && !val.includes("@")) {
      const parsed = detectIdentifier(role, val);
      setIdentifier(parsed.formatted || val.toUpperCase());
    } else {
      setIdentifier(val);
    }
    if (error) setError(undefined);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const problem = validateIdentifier(role, identifier);
    setError(problem);
    if (problem) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    login(role, detection.method, detection.formatted || identifier);
    setSending(true);
    timer.current = setTimeout(() => {
      setSending(false);
      setStep("verify");
    }, 700);
  };

  const config = ROLE_CONFIG[role];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "form" ? (
        <motion.div key="form" {...stepMotion}>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
            Welcome back
          </h1>
          <p className="mt-1 text-[14px] text-ink-2">Sign in to your MedLink workspace.</p>

          <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-5 space-y-3.5">
            <RoleToggle
              value={role}
              onChange={(r) => {
                setRole(r);
                setError(undefined);
              }}
            />
            <TextField
              label={config.idLabel}
              placeholder={config.idPlaceholder}
              hint={detection.kind !== "unknown" ? detection.hint : config.signinHint}
              error={error}
              value={identifier}
              statusBadge={
                identifier.trim()
                  ? {
                      label: detection.label,
                      isValid: detection.isValid,
                      countText: detection.countText,
                    }
                  : undefined
              }
              isValid={detection.isValid}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
            <AuthButton type="submit" loading={sending}>
              {sending ? "Sending code" : "Send one-time code"}
            </AuthButton>
          </form>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-hairline bg-canvas-alt p-3 text-[12.5px] leading-relaxed text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0 text-link" aria-hidden="true" />
            <p>
              Prototype: no real account is created. Use any valid-looking ID — the demo OTP is{" "}
              <span className="font-mono text-ink">{DEMO_OTP}</span>.
            </p>
          </div>

          <p className="mt-5 text-center text-[13.5px] text-ink-2">
            New to MedLink?{" "}
            <Link href={`${SIGNUP_ROUTE}?role=${role}`} className="font-medium text-link hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      ) : (
        <motion.div key="verify" {...stepMotion}>
          <VerifyStep role={role} masked={maskId(identifier)} mode="signin" onBack={() => setStep("form")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
