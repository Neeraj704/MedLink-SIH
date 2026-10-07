import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#0b0b0f" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#ffffff" strokeOpacity="0.16" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1" />
      <g stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round">
        <path d="M9.4 9.4 16 16" />
        <path d="M22.6 9.4 16 16" />
        <path d="M9.4 22.6 16 16" />
        <path d="M22.6 22.6 16 16" />
      </g>
      <circle cx="9.4" cy="9.4" r="3" fill="#34c759" />
      <circle cx="22.6" cy="9.4" r="3" fill="#ff9f0a" />
      <circle cx="9.4" cy="22.6" r="3" fill="#bf5af2" />
      <circle cx="22.6" cy="22.6" r="3" fill="#0a84ff" />
      <circle cx="16" cy="16" r="3.6" fill="#ffffff" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("size-7", markClassName)} />
      <span className="text-[17px] font-semibold tracking-[-0.025em] text-ink">MedLink</span>
    </span>
  );
}
