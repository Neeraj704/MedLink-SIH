"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "@/components/Link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { SIGNIN_ROUTE } from "@/lib/landing-data";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LANGUAGES,
  ROLE_CONFIG,
  detectIdentifier,
  formatMobile,
  formatName,
  maskId,
  validateIdentifier,
  type AuthRole,
} from "./auth-config";
import { AuthButton, RoleToggle, SelectField, TextField } from "./fields";
import { VerifyStep } from "./VerifyStep";

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.28, 0.11, 0.32, 1] as const },
};

type Errors = Partial<Record<"name" | "mobile" | "identifier" | "consent", string>>;

function Stepper({ step }: { step: 1 | 2 }) {
  const labels = ["Your details", "Verify mobile"];
  return (
    <div className="mb-3" aria-label={`Step ${step} of 2: ${labels[step - 1]}`} role="group">
      <div className="flex gap-1.5">
        {[1, 2].map((n) => (
          <span
            key={n}
            className={cn("h-1 flex-1 rounded-full transition-colors duration-500", n <= step ? "bg-link" : "bg-[color-mix(in_oklab,var(--ink)_12%,transparent)]")}
          />
        ))}
      </div>
      <p className="t-mono mt-1.5 text-[11px] uppercase tracking-[0.08em] text-ink-3">
        Step {step} of 2 · {labels[step - 1]}
      </p>
    </div>
  );
}

export function SignUpForm({ initialRole }: { initialRole: AuthRole }) {
  const { login } = useAuth();
  const [role, setRole] = useState<AuthRole>(initialRole);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"details" | "verify">("details");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const clear = (key: keyof Errors) => setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const rawMobileDigits = mobile.replace(/\D/g, "");
  const isMobileValid = /^[6-9]\d{9}$/.test(rawMobileDigits);
  const isNameValid = name.trim().length >= 2;

  const idDetection = useMemo(() => detectIdentifier(role, identifier), [role, identifier]);

  const handleNameChange = (val: string) => {
    setName(formatName(val));
    clear("name");
  };

  const handleMobileChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setMobile(formatMobile(digits));
    clear("mobile");
  };

  const handleIdentifierChange = (val: string) => {
    if (/^\d[\d\s-]*$/.test(val)) {
      const parsed = detectIdentifier(role, val);
      setIdentifier(parsed.formatted || val);
    } else if (role === "doctor" && /^[a-zA-Z]/i.test(val) && !val.includes("@")) {
      const parsed = detectIdentifier(role, val);
      setIdentifier(parsed.formatted || val.toUpperCase());
    } else {
      setIdentifier(val);
    }
    clear("identifier");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!isNameValid) next.name = "Enter your full name.";
    if (!isMobileValid) next.mobile = "Enter a valid 10-digit mobile number starting with 6-9.";
    const idProblem = validateIdentifier(role, identifier, { required: role === "doctor" });
    if (idProblem) next.identifier = idProblem;
    if (!consent) next.consent = "Please agree to continue.";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    login(role, role === "doctor" ? "hpr" : (idDetection.method || "abha"), rawMobileDigits || identifier, name);
    setSending(true);
    timer.current = setTimeout(() => {
      setSending(false);
      setStep("verify");
    }, 700);
  };

  const config = ROLE_CONFIG[role];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "details" ? (
        <motion.div key="details" {...stepMotion}>
          <Stepper step={1} />
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[28px]">
            Create your account
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-2">One account for diagnoses, records and consent.</p>

          <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-3.5 space-y-2.5 sm:space-y-3">
            <RoleToggle
              value={role}
              onChange={(r) => {
                setRole(r);
                clear("identifier");
              }}
            />
            <TextField
              label="Full name"
              placeholder={role === "doctor" ? "Dr. Ananya Sharma" : "Ananya Sharma"}
              value={name}
              error={errors.name}
              isValid={isNameValid}
              onChange={(e) => handleNameChange(e.target.value)}
              autoComplete="name"
            />
            <TextField
              label="Mobile number"
              adornment="+91"
              placeholder="98765 43210"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={mobile}
              error={errors.mobile}
              isValid={isMobileValid}
              statusBadge={
                mobile.trim()
                  ? {
                      label: isMobileValid ? "Valid Mobile" : "Mobile",
                      isValid: isMobileValid,
                      countText: `${rawMobileDigits.length}/10`,
                    }
                  : undefined
              }
              onChange={(e) => handleMobileChange(e.target.value)}
              autoComplete="tel-national"
            />
            <TextField
              label={config.idLabel}
              optional={role === "patient"}
              placeholder={config.idPlaceholder}
              hint={identifier.trim() ? idDetection.hint : config.idHint}
              value={identifier}
              error={errors.identifier}
              isValid={identifier.trim().length > 0 && idDetection.isValid}
              statusBadge={
                identifier.trim()
                  ? {
                      label: idDetection.label,
                      isValid: idDetection.isValid,
                      countText: idDetection.countText,
                    }
                  : undefined
              }
              onChange={(e) => handleIdentifierChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
            />
            <SelectField label="Preferred language" options={LANGUAGES} value={language} onChange={(e) => setLanguage(e.target.value)} />

            <div className="pt-0.5">
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    clear("consent");
                  }}
                  aria-invalid={errors.consent ? true : undefined}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-0.5 size-[16px] shrink-0 cursor-pointer rounded accent-[var(--blue-btn)]"
                />
                <span>I agree to MedLink handling my health data with my explicit consent, and understand this is a university prototype.</span>
              </label>
              {errors.consent && (
                <p id="consent-error" role="alert" className="mt-1 text-[12.5px] text-danger">
                  {errors.consent}
                </p>
              )}
            </div>

            <AuthButton type="submit" loading={sending} className="mt-1">
              {sending ? "Sending code" : "Continue"}
            </AuthButton>
          </form>

          <p className="mt-3.5 text-center text-[13px] text-ink-2 sm:mt-4">
            Already have an account?{" "}
            <Link href={`${SIGNIN_ROUTE}?role=${role}`} className="font-medium text-link hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      ) : (
        <motion.div key="verify" {...stepMotion}>
          <Stepper step={2} />
          <VerifyStep role={role} masked={maskId(rawMobileDigits || identifier)} mode="signup" onBack={() => setStep("details")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
