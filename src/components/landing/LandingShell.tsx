"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Assistant } from "./Assistant";
import { GuidedTour } from "./GuidedTour";
import { LandingProvider, useLanding } from "./landing-context";
import { Onboarding } from "./Onboarding";
import { SmoothScroll } from "./SmoothScroll";

function Inner({ children }: { children: ReactNode }) {
  const { smoothScroll, reduceMotion } = useLanding();
  return (
    <SmoothScroll enabled={smoothScroll && !reduceMotion}>
      {children}
      <Onboarding />
      <GuidedTour />
      <Assistant />
    </SmoothScroll>
  );
}

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LandingProvider>
        <Inner>{children}</Inner>
      </LandingProvider>
    </ThemeProvider>
  );
}
