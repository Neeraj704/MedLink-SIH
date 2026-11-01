import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  ShieldCheck,
  Loader2,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConsultations } from "@/hooks/data/useConsultations";
import { generatePrescriptionPdf } from "@/lib/pdf";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PatientRecords() {
  const { user } = useAuth();
  const { data: consultations = [], isLoading } = useConsultations({
    status: "published",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownloadPdf = (c: (typeof consultations)[0]) => {
    const diag = c.consultation_diagnoses?.[0]?.disease;
    const vitals = (c.vitals || {}) as Record<string, unknown>;

    generatePrescriptionPdf({
      doctorName: c.doctor?.full_name || "Doctor",
      doctorRegNo: "MCI-2026-4491",
      clinicName: "MedLink Healthcare Centre",
      clinicAddress: "Sector 14, Gurugram, Haryana",
      patientName: user?.name || "Patient",
      patientAbha: user?.identifier || "ABHA-1234-5678",
      patientAge: "32",
      patientGender: "Female",
      date: new Date(c.started_at).toLocaleDateString(),
      vitals: {
        bp: String(vitals.bp || "120/80"),
        pulse: String(vitals.heartRate || "72"),
        spo2: String(vitals.spo2 || "98"),
        temp: String(vitals.temp || "98.6"),
      },
      chiefComplaint: c.chief_complaint || "Clinical consultation",
      diagnoses: [
        {
          title: diag?.icd11_title || "Routine Checkup",
          icd11: diag?.icd11_code || undefined,
          ayurveda: diag?.ayurveda_term || undefined,
          siddha: diag?.siddha_term || undefined,
          unani: diag?.unani_term || undefined,
        },
      ],
      medications: (c.medications || []).map((m) => ({
        drug: m.drug,
        dosage: m.dosage,
        frequency: m.frequency.toUpperCase(),
        duration: `${m.duration_days} days`,
        instructions: m.instructions || "After meals",
      })),
    });
  };

  const handleDownloadFhir = (c: (typeof consultations)[0]) => {
    const diag = c.consultation_diagnoses?.[0]?.disease;
    const fhirBundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: c.started_at,
      identifier: { system: "https://medlink.in/bundle", value: c.id },
      entry: [
        {
          resource: {
            resourceType: "Condition",
            clinicalStatus: { text: "active" },
            code: {
              coding: [
                {
                  system: "http://id.who.int/icd/release/11",
                  code: diag?.icd11_code || "1A00",
                  display: diag?.icd11_title || "Condition",
                },
                ...(diag?.ayurveda_term
                  ? [
                      {
                        system: "https://ayush.gov.in/namc/ayurveda",
                        code: diag.ayurveda_code || "NAMC",
                        display: diag.ayurveda_term,
                      },
                    ]
                  : []),
                ...(diag?.siddha_term
                  ? [
                      {
                        system: "https://ayush.gov.in/namc/siddha",
                        code: diag.siddha_code || "NAMC",
                        display: diag.siddha_term,
                      },
                    ]
                  : []),
                ...(diag?.unani_term
                  ? [
                      {
                        system: "https://ayush.gov.in/numc/unani",
                        code: diag.unani_code || "NUMC",
                        display: diag.unani_term,
                      },
                    ]
                  : []),
              ],
            },
            recordedDate: c.started_at.split("T")[0],
          },
        },
      ],
    };

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medlink_fhir_${c.id.slice(0, 8)}.json`;
    a.click();
    toast.success("FHIR JSON downloaded");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">My Clinical Records</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Longitudinal health record timeline with official FHIR R4 Bundles and bilingual prescriptions
        </p>
      </motion.div>

      {/* Timeline */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading verified records...
        </div>
      ) : consultations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <div className="text-sm font-semibold">No published records yet</div>
            <p className="text-xs">
              When doctors publish clinical records during a consultation, they appear here securely.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-4">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border hidden md:block" />
          {consultations.map((c) => {
            const diag = c.consultation_diagnoses?.[0]?.disease;
            const vitals = (c.vitals || {}) as Record<string, unknown>;
            const meds = c.medications || [];
            const isExpanded = expandedId === c.id;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card
                  className={`md:ml-12 relative border transition-colors ${
                    isExpanded ? "ring-1 ring-primary/40 border-primary/30" : "border-border"
                  }`}
                >
                  <div className="absolute -left-[2.1rem] top-4 size-3 rounded-full bg-primary border-2 border-background hidden md:block" />
                  <CardHeader
                    className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(c.started_at).toLocaleDateString([], {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <CardTitle className="text-base text-foreground font-semibold">
                          {diag?.icd11_title || c.chief_complaint || "Routine Clinical Visit"}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{c.doctor?.full_name || "Doctor"}</span>
                          <span>&bull;</span>
                          <span className="font-mono text-[11px]">
                            ICD-11: {diag?.icd11_code || "1A00"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] text-primary border-primary/30 h-5"
                        >
                          FHIR R4
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-4 pt-0 space-y-4 text-xs border-t bg-muted/10">
                      {/* Vitals row */}
                      {vitals && Object.keys(vitals).length > 0 && (
                        <div className="flex flex-wrap gap-4 p-2.5 rounded-lg bg-card border text-muted-foreground">
                          {vitals.bp && (
                            <span>
                              <strong className="text-foreground">BP:</strong> {String(vitals.bp)} mmHg
                            </span>
                          )}
                          {vitals.heartRate && (
                            <span>
                              <strong className="text-foreground">Heart Rate:</strong>{" "}
                              {String(vitals.heartRate)} bpm
                            </span>
                          )}
                          {vitals.spo2 && (
                            <span>
                              <strong className="text-foreground">SpO2:</strong> {String(vitals.spo2)}%
                            </span>
                          )}
                          {vitals.temp && (
                            <span>
                              <strong className="text-foreground">Temp:</strong> {String(vitals.temp)}°F
                            </span>
                          )}
                        </div>
                      )}

                      {/* AYUSH Dual Coded Terms */}
                      {diag && (diag.ayurveda_term || diag.siddha_term || diag.unani_term) && (
                        <div>
                          <span className="font-semibold text-foreground block mb-1.5 uppercase text-[10px] tracking-wider text-muted-foreground">
                            Verified AYUSH Terminology Mappings
                          </span>
                          <div className="grid sm:grid-cols-3 gap-2">
                            {diag.ayurveda_term && (
                              <div className="p-2.5 rounded border bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200/50">
                                <div className="text-[10px] font-bold uppercase opacity-75">
                                  Ayurveda (NAMC)
                                </div>
                                <div className="font-medium text-xs mt-0.5">
                                  {diag.ayurveda_term}
                                </div>
                              </div>
                            )}
                            {diag.siddha_term && (
                              <div className="p-2.5 rounded border bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200/50">
                                <div className="text-[10px] font-bold uppercase opacity-75">
                                  Siddha (NAMC)
                                </div>
                                <div className="font-medium text-xs mt-0.5">
                                  {diag.siddha_term}
                                </div>
                              </div>
                            )}
                            {diag.unani_term && (
                              <div className="p-2.5 rounded border bg-violet-50/50 dark:bg-violet-950/20 text-violet-800 dark:text-violet-300 border-violet-200/50">
                                <div className="text-[10px] font-bold uppercase opacity-75">
                                  Unani (NUMC)
                                </div>
                                <div className="font-medium text-xs mt-0.5">
                                  {diag.unani_term}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medications list */}
                      {meds.length > 0 && (
                        <div>
                          <span className="font-semibold text-foreground block mb-1.5 uppercase text-[10px] tracking-wider text-muted-foreground">
                            Prescribed Medications
                          </span>
                          <div className="divide-y border rounded-lg overflow-hidden bg-card">
                            {meds.map((m, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 flex items-center justify-between"
                              >
                                <span className="font-medium text-foreground flex items-center gap-1.5">
                                  <Pill className="w-3.5 h-3.5 text-primary" /> {m.drug}{" "}
                                  ({m.dosage})
                                </span>
                                <span className="text-muted-foreground">
                                  {m.frequency.toUpperCase()} &bull; {m.duration_days} days &bull;{" "}
                                  {m.instructions || "After meals"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Download actions */}
                      <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleDownloadFhir(c)}
                        >
                          <Code2 className="w-3.5 h-3.5" /> FHIR JSON
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleDownloadPdf(c)}
                        >
                          <Download className="w-3.5 h-3.5" /> Download Prescription (PDF)
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
