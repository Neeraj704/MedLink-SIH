"use client";

import { CalendarCheck, Download, FileText, MapPin, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DEMO_OTP,
  PATIENT_COPY,
  PATIENT_TABS,
  PRESCRIPTION_LANGS,
  SAMPLE_DOCTORS,
  SAMPLE_DOCUMENTS,
  SAMPLE_PATIENTS,
  SPECIALTIES,
  type PatientTab,
} from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeader, SectionShell, Term } from "./primitives";
import { PanelTitle, Pill, PortalFrame, StatTile } from "./PortalFrame";

function Dashboard() {
  return (
    <>
      <PanelTitle>Hello, Priya</PanelTitle>
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Records" value="12" />
        <StatTile label="Prescriptions" value="4" />
        <StatTile label="Upcoming" value="1" />
      </div>
      <div className="mt-5 rounded-2xl border border-hairline p-4">
        <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
          <ShieldCheck className="size-4 text-ayurveda-text" aria-hidden="true" />
          Your <Term k="ABHA" /> is linked
        </p>
        <p className="mt-1 text-[13px] text-ink-2">Doctors see your records only after you share the OTP ({DEMO_OTP} in this demo).</p>
      </div>
      <p className="mb-2 mt-5 text-[13px] font-medium text-ink-2">Latest visit</p>
      <div className="rounded-2xl border border-hairline p-4 text-[14px]">
        <p className="font-medium text-ink">{SAMPLE_PATIENTS[0].dx}</p>
        <p className="mt-1 text-ink-2">Coded in four vocabularies · FHIR record available</p>
      </div>
    </>
  );
}

function Records() {
  return (
    <>
      <PanelTitle>My records</PanelTitle>
      <ol className="relative space-y-4 border-l border-hairline pl-5">
        {SAMPLE_PATIENTS.map((p) => (
          <li key={p.name + p.dx} className="relative">
            <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-link" aria-hidden="true" />
            <p className="text-[15px] font-medium text-ink">{p.dx}</p>
            <p className="text-[13px] text-ink-2">Consultation · coded to ICD-11 and Ayush vocabularies</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Prescriptions() {
  const [lang, setLang] = useState(PRESCRIPTION_LANGS[0].id);
  const current = PRESCRIPTION_LANGS.find((l) => l.id === lang) ?? PRESCRIPTION_LANGS[0];
  const download = () => {
    const blob = new Blob([`MedLink sample prescription (${current.label})\n\n${current.text}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${current.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PanelTitle aside={<Pill tone="blue">Sample</Pill>}>Prescription in your language</PanelTitle>
      <div role="radiogroup" aria-label="Prescription language" className="flex flex-wrap gap-1.5 sm:gap-2">
        {PRESCRIPTION_LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={lang === l.id}
            lang={l.lang}
            onClick={() => setLang(l.id)}
            className={cn("rounded-full border px-3 py-1 text-[13px] sm:px-4 sm:py-1.5 sm:text-[14px] transition-colors", lang === l.id ? "border-link bg-link/10 text-link" : "border-hairline text-ink-2 hover:text-ink")}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="mt-4 sm:mt-5 rounded-2xl border border-hairline bg-canvas-alt p-3.5 sm:p-5" aria-live="polite">
        <FileText className="mb-2.5 sm:mb-3 size-5 text-ink-3" aria-hidden="true" />
        <p lang={current.lang} className="text-[15px] sm:text-[17px] leading-relaxed text-ink">
          {current.text}
        </p>
      </div>
      <button type="button" onClick={download} className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[14px] text-ink hover:bg-canvas-alt">
        <Download className="size-4" aria-hidden="true" /> Download sample
      </button>
    </>
  );
}

function FindDoctors() {
  const [spec, setSpec] = useState<string>("All");
  const list = useMemo(() => SAMPLE_DOCTORS.filter((d) => spec === "All" || d.specialty === spec), [spec]);
  return (
    <>
      <PanelTitle>Find doctors near you</PanelTitle>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...SPECIALTIES].map((s) => (
          <button key={s} type="button" aria-pressed={spec === s} onClick={() => setSpec(s)} className={cn("shrink-0 rounded-full border px-3 py-1 text-[13px]", spec === s ? "border-link bg-link/10 text-link" : "border-hairline text-ink-2 hover:text-ink")}>
            {s}
          </button>
        ))}
      </div>
      <div className="relative mt-4 h-36 overflow-hidden rounded-2xl border border-hairline bg-canvas-alt" role="img" aria-label="Sample map of nearby doctors">
        {list.map((d) => (
          <span key={d.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-link" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            <MapPin className="size-5" fill="currentColor" fillOpacity={0.2} aria-hidden="true" />
          </span>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-hairline">
        {list.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 py-3 text-[14px]">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{d.name}</p>
              <p className="truncate text-ink-2">
                {d.specialty} · {d.clinic} · {d.km} km
              </p>
            </div>
            <Pill tone={d.available ? "green" : "neutral"}>{d.available ? d.slot : "Unavailable"}</Pill>
          </li>
        ))}
      </ul>
    </>
  );
}

function Appointments() {
  const [booked, setBooked] = useState<string | null>(null);
  const open = SAMPLE_DOCTORS.filter((d) => d.available).slice(0, 3);
  return (
    <>
      <PanelTitle>Appointments</PanelTitle>
      <ul className="space-y-3">
        {open.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 rounded-2xl border border-hairline p-4 text-[14px]">
            <div>
              <p className="font-medium text-ink">{d.name}</p>
              <p className="text-ink-2">{d.slot}</p>
            </div>
            <button
              type="button"
              onClick={() => setBooked(d.name)}
              disabled={booked === d.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-btn px-4 py-1.5 text-[13px] font-medium text-white hover:bg-btn-hover disabled:opacity-60"
            >
              <CalendarCheck className="size-3.5" aria-hidden="true" />
              {booked === d.name ? "Requested" : "Request"}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-ink-2" aria-live="polite">
        {booked ? `Sample request sent to ${booked}. Nothing is actually booked.` : "Pick a slot to see the flow."}
      </p>
    </>
  );
}

function Documents() {
  return (
    <>
      <PanelTitle>Documents</PanelTitle>
      <ul className="divide-y divide-hairline rounded-2xl border border-hairline">
        {SAMPLE_DOCUMENTS.map((d) => (
          <li key={d.name} className="flex items-center justify-between px-4 py-3 text-[14px]">
            <span className="flex items-center gap-3 text-ink">
              <FileText className="size-4 text-ink-3" aria-hidden="true" />
              {d.name}
            </span>
            <span className="text-ink-3">
              {d.type} · {d.size}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] text-ink-2">Stored encrypted. Shared through signed, time-limited links.</p>
    </>
  );
}

function Profile() {
  return (
    <>
      <PanelTitle>Profile</PanelTitle>
      <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
        {[
          ["Name", "Priya Sharma"],
          ["ABHA number", "XX-XXXX-XXXX-1234 (sample)"],
          ["Preferred language", "हिंदी"],
          ["Consent", "Share with treating doctors only"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-hairline p-4">
            <dt className="text-[12px] text-ink-3">{k}</dt>
            <dd className="mt-1 text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

const PANELS: Record<PatientTab, () => React.JSX.Element> = {
  dashboard: Dashboard,
  records: Records,
  prescriptions: Prescriptions,
  doctors: FindDoctors,
  appointments: Appointments,
  documents: Documents,
  profile: Profile,
};

export function PatientPortal() {
  const [tab, setTab] = useState<PatientTab>("dashboard");
  const Panel = PANELS[tab];
  return (
    <SectionShell id="patients" tone="grey">
      <Container wide>
        <SectionHeader id="patients" eyebrow={PATIENT_COPY.eyebrow} title={PATIENT_COPY.title} sub={PATIENT_COPY.sub} />
        <Reveal className="mx-auto mt-14 max-w-[1080px]">
          <PortalFrame idPrefix="pat" title="MedLink · Patient Portal" tabs={PATIENT_TABS} active={tab} onChange={setTab} feature="patientPortal">
            <Panel />
          </PortalFrame>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
