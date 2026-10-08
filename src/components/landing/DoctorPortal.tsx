"use client";

import { BadgeCheck, Check, Download, FileJson, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DEMO_OTP, DOCTOR_COPY, DOCTOR_TABS, ROSETTA, SAMPLE_APPOINTMENTS, SAMPLE_PATIENTS, type DoctorTab } from "@/lib/landing-data";
import { cn } from "@/lib/utils";
import { Container, Reveal, SYSTEM_VARS, SectionHeader, SectionShell, Term } from "./primitives";
import { PanelTitle, Pill, PortalFrame, StatTile, inputCls } from "./PortalFrame";
import { useLanding } from "./landing-context";
import { useSmoothScroll } from "./SmoothScroll";

const STEPS = ["Patient", "Vitals", "History", "Diagnosis", "Prescription"];

function statusTone(s: string) {
  if (s === "FHIR Published" || s === "accepted") return "green" as const;
  if (s === "declined") return "red" as const;
  if (s === "Draft") return "neutral" as const;
  return "amber" as const;
}

function Dashboard() {
  const [otp, setOtp] = useState("");
  const linked = otp === DEMO_OTP;
  return (
    <>
      <PanelTitle>Good morning, Dr. Rao</PanelTitle>
      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Patients" value="128" />
        <StatTile label="Today" value="6" />
        <StatTile label="Published" value="94" />
      </div>
      <div className="mt-5 rounded-2xl border border-hairline p-4">
        <label htmlFor="doc-otp" className="text-[14px] font-medium text-ink">
          Link a patient by <Term k="ABHA" /> OTP
        </label>
        <div className="mt-2 flex gap-2">
          <input id="doc-otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder={`Demo OTP ${DEMO_OTP}`} className={cn(inputCls, "t-mono tracking-[0.3em]")} />
        </div>
        <p className={cn("mt-2 text-[13px]", linked ? "text-ayurveda-text" : "text-ink-3")} aria-live="polite">
          {linked ? "Patient linked — Priya Sharma added to your list." : otp.length === 6 ? "That code doesn't match the demo OTP." : "Enter the 6-digit code the patient receives."}
        </p>
      </div>
      <p className="mb-2 mt-5 text-[13px] font-medium text-ink-2">Recent patients</p>
      <ul className="divide-y divide-hairline">
        {SAMPLE_PATIENTS.slice(0, 3).map((p) => (
          <li key={p.name} className="flex items-center justify-between py-2.5 text-[14px]">
            <span className="text-ink">{p.name}</span>
            <span className="text-ink-2">{p.dx}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Patients() {
  const [q, setQ] = useState("");
  const list = SAMPLE_PATIENTS.filter((p) => `${p.name} ${p.dx}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PanelTitle>Patients</PanelTitle>
      <label htmlFor="doc-patient-search" className="sr-only">
        Search patients
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
        <input id="doc-patient-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or diagnosis" className={cn(inputCls, "pl-9")} />
      </div>
      <ul className="mt-4 space-y-2">
        {list.map((p) => (
          <li key={p.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline p-3">
            <div>
              <p className="text-[15px] font-medium text-ink">{p.name}</p>
              <p className="t-mono text-ink-3">ABHA {p.abha}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-ink-2">{p.dx}</span>
              <Pill tone={statusTone(p.status)}>{p.status}</Pill>
            </div>
          </li>
        ))}
        {list.length === 0 ? <li className="py-6 text-center text-[14px] text-ink-3">No sample patients match.</li> : null}
      </ul>
    </>
  );
}

function Consultation() {
  const [step, setStep] = useState(3);
  return (
    <>
      <PanelTitle>New consultation</PanelTitle>
      <ol className="flex gap-1" aria-label="Consultation steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <button type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined} className="w-full text-left">
              <span className={cn("block h-1 rounded-full transition-colors", i <= step ? "bg-link" : "bg-hairline")} />
              <span className={cn("mt-1.5 sm:mt-2 block truncate text-[10px] sm:text-[12px]", step === i ? "font-semibold text-ink" : "text-ink-3")}>{s}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {step === 0 && (
          <>
            <Field label="Patient" value="Priya Sharma" />
            <Field label="ABHA" value="91-••••-••••-2041" mono />
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Blood pressure" value="118 / 76 mmHg" />
            <Field label="Heart rate" value="72 bpm" />
            <Field label="SpO₂" value="98 %" />
            <Field label="Temperature" value="37.8 °C" />
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Chief complaint" value="Loose stools, abdominal cramps · 2 days" />
            <Field label="History" value="No known allergies" />
          </>
        )}
        {step === 3 && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-[13px] text-ink-2">Diagnosis · four codings</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["icd", "ICD-11", "Gastroenteritis"],
                  ["ayurveda", "Ayurveda", "Grahani"],
                  ["siddha", "Siddha", "Kirani"],
                  ["unani", "Unani", "Ishaal"],
                ] as const
              ).map(([k, l, t]) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-[13px] text-ink">
                  <span className="size-2 rounded-full" style={{ background: SYSTEM_VARS[k].fill }} aria-hidden="true" />
                  <span style={{ color: SYSTEM_VARS[k].text }}>{l}</span> {t}
                </span>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ayurveda-text">
              <Check className="size-4" strokeWidth={2} aria-hidden="true" /> Confirmed by doctor
            </p>
          </div>
        )}
        {step === 4 && (
          <>
            <Field label="Drug" value="Paracetamol 500 mg" />
            <Field label="Frequency" value="Twice a day after meals" />
            <Field label="Duration" value="5 days" />
            <Field label="Language" value="Hindi + English PDF" />
          </>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-full px-4 py-2 text-[14px] text-link disabled:text-ink-3">
          Back
        </button>
        <button type="button" disabled={step === STEPS.length - 1} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="rounded-full bg-btn px-4 py-2 text-[14px] font-medium text-white disabled:opacity-40">
          Continue
        </button>
      </div>
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-canvas-alt px-3 py-2">
      <p className="text-[11px] text-ink-3">{label}</p>
      <p className={cn("text-[14px] text-ink", mono && "t-mono")}>{value}</p>
    </div>
  );
}

function Translation() {
  const [picked, setPicked] = useState<string[]>(["gastro"]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <>
      <PanelTitle>Code translation</PanelTitle>
      <p className="mb-3 text-[13px] text-ink-2">Pick one or more diagnoses for this visit.</p>
      <div className="flex flex-wrap gap-2">
        {ROSETTA.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={picked.includes(r.id)}
            onClick={() => toggle(r.id)}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px]", picked.includes(r.id) ? "border-link text-link" : "border-hairline text-ink-2")}
          >
            {picked.includes(r.id) ? <Check className="size-3.5" strokeWidth={2} aria-hidden="true" /> : null}
            {r.chip}
          </button>
        ))}
      </div>
      <ul className="mt-5 space-y-2">
        {ROSETTA.filter((r) => picked.includes(r.id)).map((r) => (
          <li key={r.id} className="rounded-xl border border-hairline p-3">
            <p className="text-[15px] font-medium text-ink">
              {r.icd.title} <span className="t-mono text-ink-3">· {r.icd.code}</span>
            </p>
            <p className="mt-1 text-[13px] text-ink-2">
              {(["ayurveda", "siddha", "unani"] as const)
                .map((s) => {
                  const res = r.results[s];
                  return res.kind === "match" ? `${res.term} ${res.confidence}%` : res.kind === "low" ? "review" : "—";
                })
                .join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Appointments() {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");
  const [rows, setRows] = useState(SAMPLE_APPOINTMENTS);
  const list = rows.filter((r) => filter === "all" || r.status === filter);
  const setStatus = (name: string, status: string) => setRows((rs) => rs.map((r) => (r.name === name ? { ...r, status } : r)));
  const exportCsv = () => {
    const csv = ["name,time,diagnosis,code,status", ...rows.map((r) => [r.name, r.time, r.dx, r.code, r.status].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "medlink-appointments-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PanelTitle
        aside={
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[13px] text-ink">
            <Download className="size-3.5" strokeWidth={2} aria-hidden="true" /> Export CSV
          </button>
        }
      >
        Appointments
      </PanelTitle>
      <div className="mb-4 flex flex-wrap gap-1" role="group" aria-label="Filter appointments">
        {(["all", "pending", "accepted", "declined"] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-[13px] capitalize", filter === f ? "bg-btn text-white" : "text-ink-2")}>
            {f}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {list.map((r) => (
          <li key={r.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline p-3">
            <div>
              <p className="text-[15px] font-medium text-ink">
                <span className="t-mono mr-2 text-ink-3">{r.time}</span>
                {r.name}
              </p>
              <p className="text-[13px] text-ink-2">
                {r.dx} <span className="t-mono">· {r.code}</span>
              </p>
            </div>
            {r.status === "pending" ? (
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setStatus(r.name, "accepted")} aria-label={`Accept ${r.name}`} className="inline-flex size-8 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ayurveda)_14%,transparent)] text-ayurveda-text">
                  <Check className="size-4" strokeWidth={2} />
                </button>
                <button type="button" onClick={() => setStatus(r.name, "declined")} aria-label={`Decline ${r.name}`} className="inline-flex size-8 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger">
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function FhirRecords() {
  const { setFhirFocus } = useLanding();
  const { scrollTo } = useSmoothScroll();
  const [generated, setGenerated] = useState<string[]>(["Priya Sharma"]);
  return (
    <>
      <PanelTitle>FHIR records</PanelTitle>
      <ul className="space-y-2">
        {SAMPLE_PATIENTS.map((p) => {
          const done = generated.includes(p.name);
          return (
            <li key={p.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline p-3">
              <div>
                <p className="text-[15px] font-medium text-ink">{p.name}</p>
                <p className="text-[13px] text-ink-2">{p.dx}</p>
              </div>
              {done ? (
                <button
                  type="button"
                  onClick={() => {
                    setFhirFocus("Condition");
                    scrollTo("#fhir");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[13px] text-link"
                >
                  <FileJson className="size-3.5" strokeWidth={2} aria-hidden="true" /> Preview bundle
                </button>
              ) : (
                <button type="button" onClick={() => setGenerated((g) => [...g, p.name])} className="rounded-full bg-btn px-3 py-1.5 text-[13px] font-medium text-white">
                  Generate FHIR
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Settings() {
  return (
    <>
      <PanelTitle>Clinic settings</PanelTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Clinic name" value="Sushruta Wellness Clinic" />
        <Field label="Hours" value="Mon–Sat · 9:00–18:00" />
        <div className="sm:col-span-2">
          <Field label="Address" value="12 MI Road, Jaipur, Rajasthan" />
        </div>
      </div>
      <p className="mb-2 mt-5 text-[13px] text-ink-2">Specialisations</p>
      <div className="flex flex-wrap gap-2">
        {["Ayurveda", "General Medicine", "Panchakarma"].map((s) => (
          <Pill key={s} tone="blue">
            {s}
          </Pill>
        ))}
      </div>
    </>
  );
}

function Profile() {
  return (
    <>
      <PanelTitle>Profile</PanelTitle>
      <div className="flex items-center gap-4 rounded-2xl border border-hairline p-5">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--ayurveda)_16%,transparent)] text-[19px] font-semibold text-ayurveda-text">AR</span>
        <div>
          <p className="text-[19px] font-semibold text-ink">Dr. Ananya Rao</p>
          <p className="flex items-center gap-1 text-[14px] text-ayurveda-text">
            <BadgeCheck className="size-4" strokeWidth={2} aria-hidden="true" /> <Term k="HPR" /> verified
          </p>
          <p className="t-mono mt-1 text-ink-3">HPR-XXXXXXXX · 11 yrs experience</p>
        </div>
      </div>
    </>
  );
}

const PANELS: Record<DoctorTab, () => React.JSX.Element> = {
  dashboard: Dashboard,
  patients: Patients,
  consultation: Consultation,
  translation: Translation,
  appointments: Appointments,
  fhir: FhirRecords,
  settings: Settings,
  profile: Profile,
};

export function DoctorPortal() {
  const [tab, setTab] = useState<DoctorTab>("consultation");
  const meta = useMemo(() => DOCTOR_TABS.find((t) => t.id === tab), [tab]);
  const Panel = PANELS[tab];
  return (
    <SectionShell id="doctors" tone="light" tour="portals">
      <Container wide>
        <SectionHeader id="doctors" eyebrow={DOCTOR_COPY.eyebrow} title={DOCTOR_COPY.title} sub={DOCTOR_COPY.sub} />
        <Reveal className="mx-auto mt-14 max-w-[1080px]">
          <PortalFrame idPrefix="doc" title="MedLink · Doctor Console" tabs={DOCTOR_TABS} active={tab} onChange={setTab} feature="doctorPortal" description={meta?.feature}>
            <Panel />
          </PortalFrame>
        </Reveal>
      </Container>
    </SectionShell>
  );
}
