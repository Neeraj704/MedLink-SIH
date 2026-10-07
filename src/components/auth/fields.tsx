"use client";

import { motion } from "framer-motion";
import { ChevronDown, Loader2, Stethoscope, UserRound } from "lucide-react";
import { useId, type ComponentProps, type KeyboardEvent } from "react";
import { btnPrimary } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";
import { ROLE_CONFIG, ROLES, type AuthRole } from "./auth-config";

const control =
  "h-12 w-full rounded-xl border bg-raised px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-3 focus:border-link focus:ring-4 focus:ring-[color-mix(in_oklab,var(--blue)_22%,transparent)]";
const idleBorder =
  "border-[color-mix(in_oklab,var(--ink)_16%,transparent)] hover:border-[color-mix(in_oklab,var(--ink)_30%,transparent)]";

function FieldShell({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-ink-3">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-d`} role="alert" className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-d`} className="mt-1.5 text-[13px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  adornment?: string;
  optional?: boolean;
};

export function TextField({ label, hint, error, adornment, optional, className, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error}>
      <div className="relative">
        {adornment && (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[16px] text-ink-2">{adornment}</span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-d` : undefined}
          className={cn(control, error ? "border-danger" : idleBorder, adornment && "pl-12", className)}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id"> & {
  label: string;
  error?: string;
  options: string[];
};

export function SelectField({ label, error, options, className, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-d` : undefined}
          className={cn(control, "appearance-none pr-10", error ? "border-danger" : idleBorder, className)}
          {...props}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
      </div>
    </FieldShell>
  );
}

const ROLE_ICON = { patient: UserRound, doctor: Stethoscope } as const;

export function RoleToggle({ value, onChange }: { value: AuthRole; onChange: (role: AuthRole) => void }) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = value === "patient" ? "doctor" : "patient";
    onChange(next);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-role="${next}"]`)?.focus();
  };
  return (
    <div>
      <p id="role-label" className="mb-1.5 text-[13px] font-medium text-ink">
        I am a
      </p>
      <div
        role="radiogroup"
        aria-labelledby="role-label"
        onKeyDown={onKeyDown}
        className="grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-canvas-alt p-1"
      >
        {ROLES.map((r) => {
          const Icon = ROLE_ICON[r];
          const active = value === r;
          return (
            <button
              key={r}
              type="button"
              role="radio"
              data-role={r}
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(r)}
              className={cn(
                "relative flex h-10 items-center justify-center gap-2 rounded-lg text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-link",
                active ? "text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {active && (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 rounded-lg border border-hairline bg-raised shadow-sm"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-4" strokeWidth={1.8} aria-hidden="true" />
              <span className="relative">{ROLE_CONFIG[r].label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AuthButton({ loading, children, className, ...props }: ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(btnPrimary, "h-12 w-full text-[16px] disabled:cursor-not-allowed disabled:opacity-50", className)}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
