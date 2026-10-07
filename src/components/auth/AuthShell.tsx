"use client";

import { MotionConfig } from "framer-motion";
import Link from "@/components/Link";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/Nav";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HERO, SIGNIN_ROUTE, SIGNUP_ROUTE } from "@/lib/landing-data";
import { AuthShowcase } from "./AuthShowcase";

export function AuthShell({ mode, children }: { mode: "signin" | "signup"; children: ReactNode }) {
  const alt =
    mode === "signin"
      ? { prompt: "New here?", label: "Create account", href: SIGNUP_ROUTE }
      : { prompt: "Have an account?", label: "Sign in", href: SIGNIN_ROUTE };
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-dvh flex-col">
            <header className="flex items-center justify-between px-6 py-5 sm:px-10">
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
            <main id="main" className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
              <div className="w-full max-w-[400px]">{children}</div>
            </main>
            <footer className="px-6 py-5 text-center text-[12px] text-ink-3 sm:px-10">{HERO.notice}</footer>
          </div>
          <AuthShowcase />
        </div>
      </MotionConfig>
    </ThemeProvider>
  );
}
