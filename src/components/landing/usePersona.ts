"use client";

import { PERSONAS } from "@/lib/landing-data";
import { useLanding } from "./landing-context";

export function usePersona() {
  const { persona, setPersona } = useLanding();
  const config = PERSONAS.find((p) => p.id === persona) ?? null;
  const isRecommended = (sectionId: string) => Boolean(config?.recommended.includes(sectionId));
  return { persona, setPersona, config, isRecommended };
}
