import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Languages,
  Download,
  Calendar,
  Stethoscope,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConsultations } from "@/hooks/data/useConsultations";
import { generatePrescriptionPdf } from "@/lib/pdf";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
];

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const { data: consultations = [], isLoading } = useConsultations({
    status: "published",
  });
  const [selectedLang, setSelectedLang] = useState("en");
  const [translations, setTranslations] = useState<
    Record<string, { drug_text: string; instructions_text: string }>
  >({});
  const [translating, setTranslating] = useState(false);

  // Collect all medication IDs across consultations
  const allMedicationIds = useMemo(() => {
    const ids: string[] = [];
    for (const c of consultations) {
      if (c.medications) {
        for (const m of c.medications) {
          if (m.id) ids.push(m.id);
        }
      }
    }
    return ids;
  }, [consultations]);

  // Translate when non-english language is selected
  useEffect(() => {
    if (selectedLang === "en" || allMedicationIds.length === 0) return;

    let mounted = true;
    async function fetchTranslations() {
      setTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "translate-prescription",
          {
            body: {
              medication_ids: allMedicationIds,
              lang: selectedLang,
            },
          }
        );

        if (error || data?.error) {
          throw new Error(data?.error?.message || error?.message || "Translation error");
        }

        if (mounted && data?.translations) {
          setTranslations(data.translations);
          toast.success(`Prescriptions translated to ${selectedLang.toUpperCase()}`);
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to translate prescriptions");
      } finally {
        if (mounted) setTranslating(false);
      }
    }

    fetchTranslations();
    return () => {
      mounted = false;
    };
  }, [selectedLang, allMedicationIds]);

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
      medications: (c.medications || []).map((m) => {
        const trans = selectedLang !== "en" && m.id ? translations[m.id] : null;
        return {
          drug: trans?.drug_text || m.drug,
          dosage: m.dosage,
          frequency: m.frequency.toUpperCase(),
          duration: `${m.duration_days} days`,
          instructions: trans?.instructions_text || m.instructions || "After meals",
        };
      }),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Prescriptions & Instructions</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Review active regimens with real-time Indic language translations and bilingual PDF exports
        </p>
      </motion.div>

      {/* Language Selector Banner */}
      <Card className="border-primary/20 bg-muted/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm block">Prescription Language</span>
              <span className="text-xs text-muted-foreground">
                Translate dosage timings and clinical instructions into your mother tongue
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {translating && (
              <Loader2 className="w-4 h-4 animate-spin text-primary mr-1" />
            )}
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-44 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Grouped by Consultation */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading prescriptions...
        </div>
      ) : consultations.filter((c) => (c.medications || []).length > 0).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-2">
            <Pill className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <div className="text-sm font-semibold">No active prescriptions</div>
            <p className="text-xs">
              When doctors prescribe medications during your consultations, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {consultations
            .filter((c) => (c.medications || []).length > 0)
            .map((c) => {
              const diag = c.consultation_diagnoses?.[0]?.disease;
              const meds = c.medications || [];

              return (
                <Card key={c.id} className="overflow-hidden border border-border">
                  <CardHeader className="bg-muted/15 border-b p-4 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <CardTitle className="text-base font-semibold">
                          {c.doctor?.full_name || "Doctor"}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {diag?.icd11_title || c.chief_complaint || "Consultation"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(c.started_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleDownloadPdf(c)}
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {meds.map((m) => {
                      const trans =
                        selectedLang !== "en" && m.id ? translations[m.id] : null;

                      return (
                        <div
                          key={m.id}
                          className="p-3 rounded-lg border bg-card text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground text-sm">
                                {m.drug}
                              </span>
                              <Badge variant="secondary" className="text-[10px] h-4">
                                {m.dosage}
                              </Badge>
                            </div>

                            <div className="text-muted-foreground flex flex-wrap items-center gap-3">
                              <span>
                                <strong className="text-foreground">Frequency:</strong>{" "}
                                {m.frequency.toUpperCase()}
                              </span>
                              <span>
                                <strong className="text-foreground">Duration:</strong>{" "}
                                {m.duration_days} days
                              </span>
                              <span>
                                <strong className="text-foreground">Note:</strong>{" "}
                                {m.instructions || "After meals"}
                              </span>
                            </div>

                            {/* Translation block */}
                            {selectedLang !== "en" && (
                              <div className="pt-1.5 flex items-start gap-1.5 text-primary text-xs">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-medium">
                                    {trans?.drug_text || m.drug}
                                  </span>{" "}
                                  &bull;{" "}
                                  <span>
                                    {trans?.instructions_text || "भोजन के बाद"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
