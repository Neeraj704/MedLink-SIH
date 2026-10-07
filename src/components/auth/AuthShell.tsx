"use client";

import { MotionConfig } from "framer-motion";
import Link from "@/components/Link";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/Nav";
import { HERO, SIGNIN_ROUTE, SIGNUP_ROUTE } from "@/lib/landing-data";
import { AuthShowcase } from "./AuthShowcase";

export function AuthShell({ mode, children }: { mode: "signin" | "signup"; children: ReactNode }) {
  const alt =
    mode === "signin"
      ? { prompt: "New here?", label: "Create account", href: SIGNUP_ROUTE }
      : { prompt: "Have an account?", label: "Sign in", href: SIGNIN_ROUTE };
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh lg:h-dvh lg:max-h-dvh lg:overflow-hidden bg-canvas text-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-h-dvh lg:min-h-0 lg:h-full flex-col overflow-y-auto lg:overflow-y-hidden">
          <header className="flex shrink-0 items-center justify-between px-6 py-3.5 sm:px-10 sm:py-4">
            <Link href="/" aria-label="MedLink home" className="rounded-md">
              <Logo />
            </Link>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="hidden text-ink-3 sm:inline">{alt.prompt}</span>
              <Link href={alt.href} className="font-medium text-link hover:underline">
                {alt.label}
              </Link>
              <ThemeToggle />
            </div>
          </header>
          <main id="main" className="flex flex-1 min-h-0 items-center justify-center px-6 py-2 sm:px-10 sm:py-3">
            <div className="w-full max-w-[400px]">{children}</div>
          </main>
          <footer className="shrink-0 px-6 py-2.5 text-center text-[12px] text-ink-3 sm:px-10 sm:py-3">
            {HERO.notice}
          </footer>
        </div>
        <AuthShowcase />
      </div>
    </MotionConfig>
  );
}
