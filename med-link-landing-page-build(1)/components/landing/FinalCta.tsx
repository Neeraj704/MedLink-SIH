"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTH_ROUTE, FINAL_CTA, LINKS, PROTOTYPE_TIP } from "@/lib/landing-data";
import { Caption, Container, Reveal, SectionShell, Stagger, StaggerItem } from "./primitives";

const ROLES = ["doctor", "patient"] as const;

export function FinalCta() {
  return (
    <SectionShell id="start" tone="dark" className="overflow-hidden">
      <Container>
        <Reveal className="text-center">
          <h2 id="start-title" className="mx-auto max-w-[900px] text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
            {FINAL_CTA.title}
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[19px] text-ink-2">{FINAL_CTA.sub}</p>
        </Reveal>
        <Stagger className="mx-auto mt-14 grid max-w-[820px] gap-4 sm:grid-cols-2">
          {FINAL_CTA.paths.map((p, i) => (
            <StaggerItem key={p.title}>
              <Link href={`${AUTH_ROUTE}?role=${ROLES[i]}`} className="glass group flex h-full items-center justify-between gap-4 rounded-[28px] p-7 transition-transform duration-300 hover:-translate-y-1">
                <span>
                  <span className="block text-[22px] font-semibold tracking-[-0.02em] text-ink">{p.title}</span>
                  <span className="mt-1 block text-[15px] text-ink-2">{p.body}</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-ink-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8 flex justify-center">
          <Caption>{PROTOTYPE_TIP}</Caption>
        </div>
        <p className="mt-6 text-center text-[14px] text-ink-3">
          <a href={LINKS.live} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ink hover:underline">
            Open the live prototype
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </Container>
    </SectionShell>
  );
}
