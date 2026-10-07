"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS, TOUR_STOPS, type Persona } from "@/lib/landing-data";

export type OnboardingStep = 0 | 1 | 2 | 3;

type LandingState = {
  persona: Persona | null;
  setPersona: (p: Persona) => void;
  reduceMotion: boolean;
  osReduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  smoothScroll: boolean;
  setSmoothScroll: (v: boolean) => void;
  onboardingOpen: boolean;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (s: OnboardingStep) => void;
  openOnboarding: (step?: OnboardingStep) => void;
  closeOnboarding: () => void;
  tourIndex: number | null;
  startTour: () => void;
  setTourIndex: (i: number | null) => void;
  fhirFocus: string | null;
  setFhirFocus: (id: string | null) => void;
};

const LandingContext = createContext<LandingState | null>(null);

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

const PERSONA_IDS: Persona[] = ["doctor", "patient", "policy", "explorer"];

export function LandingProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona | null>(null);
  const [osReduceMotion, setOsReduce] = useState(false);
  const [reduceOverride, setReduceOverride] = useState<boolean | null>(null);
  const [smoothScroll, setSmoothState] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(0);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [fhirFocus, setFhirFocus] = useState<string | null>(null);

  useEffect(() => {
    const storedPersona = read(STORAGE_KEYS.persona);
    if (storedPersona && PERSONA_IDS.includes(storedPersona as Persona)) setPersonaState(storedPersona as Persona);
    const storedReduce = read(STORAGE_KEYS.reduceMotion);
    if (storedReduce !== null) setReduceOverride(storedReduce === "true");
    const storedSmooth = read(STORAGE_KEYS.smooth);
    if (storedSmooth !== null) setSmoothState(storedSmooth === "true");

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setOsReduce(e.matches);
    mq.addEventListener("change", onChange);

    const forced = new URLSearchParams(window.location.search).get("welcome") === "1";
    if (forced || read(STORAGE_KEYS.onboarded) !== "true") {
      setOnboardingStep(0);
      setOnboardingOpen(true);
    }
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    write(STORAGE_KEYS.persona, p);
  }, []);
  const setReduceMotion = useCallback((v: boolean) => {
    setReduceOverride(v);
    write(STORAGE_KEYS.reduceMotion, String(v));
  }, []);
  const setSmoothScroll = useCallback((v: boolean) => {
    setSmoothState(v);
    write(STORAGE_KEYS.smooth, String(v));
  }, []);
  const openOnboarding = useCallback((step: OnboardingStep = 0) => {
    setTourIndex(null);
    setOnboardingStep(step);
    setOnboardingOpen(true);
  }, []);
  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false);
    write(STORAGE_KEYS.onboarded, "true");
  }, []);
  const startTour = useCallback(() => {
    setOnboardingOpen(false);
    write(STORAGE_KEYS.onboarded, "true");
    if (TOUR_STOPS.length) setTourIndex(0);
  }, []);

  const reduceMotion = reduceOverride ?? osReduceMotion;

  const value = useMemo<LandingState>(
    () => ({
      persona,
      setPersona,
      reduceMotion,
      osReduceMotion,
      setReduceMotion,
      smoothScroll,
      setSmoothScroll,
      onboardingOpen,
      onboardingStep,
      setOnboardingStep,
      openOnboarding,
      closeOnboarding,
      tourIndex,
      startTour,
      setTourIndex,
      fhirFocus,
      setFhirFocus,
    }),
    [persona, setPersona, reduceMotion, osReduceMotion, setReduceMotion, smoothScroll, setSmoothScroll, onboardingOpen, onboardingStep, openOnboarding, closeOnboarding, tourIndex, startTour, fhirFocus],
  );

  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

export function useLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside LandingProvider");
  return ctx;
}
