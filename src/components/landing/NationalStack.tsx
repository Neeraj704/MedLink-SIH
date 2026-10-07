"use client";

import { BadgeCheck, Building2, FileJson, Globe, IdCard, Landmark, Network, Receipt, type LucideIcon } from "lucide-react";
import { NATIONAL } from "@/lib/landing-data";
import { Container, IconTile, SectionHeader, SectionShell, Stagger, StaggerItem, StatusChip } from "./primitives";

const ICONS: Record<string, LucideIcon> = { IdCard, BadgeCheck, Network, Building2, Receipt, Globe, FileJson, Landmark };

export function NationalStack() {
  return (
    <SectionShell id="stack" tone="white">
      <Container>
        <SectionHeader id="stack" eyebrow="The national stack" title={NATIONAL.title} sub={NATIONAL.sub} />
        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NATIONAL.rails.map((r) => {
            const Icon = ICONS[r.icon] ?? Globe;
            return (
              <StaggerItem key={r.name} className="card-surface flex flex-col rounded-[24px] p-6">
                <IconTile>
                  <Icon className="size-5" strokeWidth={1.75} />
                </IconTile>
                <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.015em] text-ink">{r.name}</h3>
                <p className="mt-2 flex-1 text-[15px] text-ink-2">{r.role}</p>
                <div className="mt-4">
                  <StatusChip feature={r.feature} />
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mt-10 text-center text-[15px] text-ink-2">{NATIONAL.note}</p>
      </Container>
    </SectionShell>
  );
}
