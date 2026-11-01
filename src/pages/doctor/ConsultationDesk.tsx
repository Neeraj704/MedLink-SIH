import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Weight,
  FileText,
  Plus,
  Trash2,
  Save,
  Send,
  Search,
  Check,
  Code2,
  Sparkles,
  AlertCircle,
  Stethoscope,
  UserPlus,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkedPatients } from "@/hooks/data/usePatients";
import {
  useSaveConsultationDraft,
  usePublishConsultation,
} from "@/hooks/data/useConsultations";
import { useDiseaseSearch, type DiseaseMapping } from "@/hooks/data/useDiseaseSearch";
import { FhirViewer } from "@/components/common/FhirViewer";
import { supabase } from "@/integrations/supabase/client";

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions: string;
}

interface DiagnosisItem {
  id: string;
  diseaseId?: number;
  disease?: DiseaseMapping;
  query: string;
  confirmedByDoctor: boolean;
}

// Autocomplete search row component
function DiagnosisSearchRow({
  query,
  onSelect,
  onQueryChange,
  isError,
}: {
  query: string;
  onSelect: (item: DiseaseMapping) => void;
  onQueryChange: (q: string) => void;
  isError?: boolean;
}) {
  const { data: results = [], isLoading } = useDiseaseSearch(query, 8);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="Search disease by name or ICD-11 code (e.g. Cholera, 1A00, Migraine)..."
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`pl-11 pr-10 h-12 text-sm ${
            isError ? "border-destructive" : "border-primary/20 focus:border-primary"
          }`}
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && query.trim().length >= 2 && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-popover border rounded-xl shadow-2xl max-h-[360px] overflow-y-auto divide-y border-border animate-in fade-in slide-in-from-top-2 duration-150">
          {results.map((d) => (
            <button
              key={d.id}
              type="button"
              className="w-full text-left p-3.5 hover:bg-accent/50 transition-colors flex flex-col gap-1 border-b last:border-b-0"
              onClick={() => {
                onSelect(d);
                setIsOpen(false);
              }}
            >
              <div className="font-semibold text-primary text-base">
                {d.icd11_title}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                ICD-11: {d.icd11_code || "N/A"}
              </div>
              <div className="text-[11px] text-foreground/80 space-y-0.5 mt-0.5">
                {d.ayurveda_term && (
                  <div>
                    <span className="font-semibold">Ayurveda:</span> {d.ayurveda_term}{" "}
                    <span className="text-muted-foreground">
                      ({Math.round((d.ayurveda_sim || 0) * 100)}%)
                    </span>
                  </div>
                )}
                {d.siddha_term && (
                  <div>
                    <span className="font-semibold">Siddha:</span> {d.siddha_term}{" "}
                    <span className="text-muted-foreground">
                      ({Math.round((d.siddha_sim || 0) * 100)}%)
                    </span>
                  </div>
                )}
                {d.unani_term && (
                  <div>
                    <span className="font-semibold">Unani:</span> {d.unani_term}{" "}
                    <span className="text-muted-foreground">
                      ({Math.round((d.unani_sim || 0) * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConsultationDesk() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: linkedPatients = [], isLoading: patientsLoading } = useLinkedPatients();

  const patientParam = searchParams.get("patient");
  const consultIdParam = searchParams.get("id");
  const appointmentParam = searchParams.get("appointment");

  const [activeConsultId, setActiveConsultId] = useState<string | undefined>(
    consultIdParam || undefined
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patientParam || ""
  );

  const [patientInfo, setPatientInfo] = useState({
    name: "",
    abha: "",
    mobile: "",
    gender: "",
    bloodGroup: "",
  });

  const [vitals, setVitals] = useState({
    bp: "120/80",
    heartRate: "72",
    spo2: "98",
    temp: "98.6",
    weight: "70",
  });

  const [complaint, setComplaint] = useState("");
  const [history, setHistory] = useState("");

  const [medications, setMedications] = useState<Medication[]>([
    {
      drug: "",
      dosage: "",
      frequency: "bd",
      duration_days: 5,
      instructions: "After meals with warm water",
    },
  ]);

  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([
    {
      id: crypto.randomUUID(),
      query: "",
      confirmedByDoctor: true,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showFhirDialog, setShowFhirDialog] = useState(false);
  const [publishedBundle, setPublishedBundle] = useState<Record<string, unknown> | null>(null);

  const saveDraftMutation = useSaveConsultationDraft();
  const publishMutation = usePublishConsultation();

  // Auto-select patient from query param or first linked patient
  useEffect(() => {
    if (patientParam && linkedPatients.length > 0) {
      const p = linkedPatients.find((item) => item.id === patientParam);
      if (p) {
        setSelectedPatientId(p.id);
        setPatientInfo({
          name: p.full_name,
          abha: p.abha_number || "",
          mobile: p.mobile || "",
          gender: p.gender || "Patient",
          bloodGroup: p.blood_group || "O+",
        });
      }
    } else if (!selectedPatientId && linkedPatients.length > 0) {
      const first = linkedPatients[0];
      setSelectedPatientId(first.id);
      setPatientInfo({
        name: first.full_name,
        abha: first.abha_number || "",
        mobile: first.mobile || "",
        gender: first.gender || "Patient",
        bloodGroup: first.blood_group || "O+",
      });
    }
  }, [patientParam, linkedPatients, selectedPatientId]);

  // Load existing draft if consultIdParam
  useEffect(() => {
    if (!consultIdParam) return;
    async function loadDraft() {
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          consultation_diagnoses(*, disease:disease_mappings(*)),
          medications(*)
        `)
        .eq("id", consultIdParam)
        .maybeSingle();

      if (error || !data) return;

      setActiveConsultId(data.id);
      setSelectedPatientId(data.patient_id);
      if (data.vitals && typeof data.vitals === "object") {
        const v = data.vitals as Record<string, string>;
        setVitals({
          bp: v.bp || "120/80",
          heartRate: String(v.heartRate || "72"),
          spo2: String(v.spo2 || "98"),
          temp: String(v.temp || "98.6"),
          weight: String(v.weight || "70"),
        });
      }
      if (data.chief_complaint) setComplaint(data.chief_complaint);
      if (data.history) setHistory(data.history);

      const dRows = data.consultation_diagnoses as Array<{
        id: string;
        disease_id: number;
        confirmed_by_doctor: boolean;
        disease?: DiseaseMapping;
      }>;
      if (dRows && dRows.length > 0) {
        setDiagnoses(
          dRows.map((d) => ({
            id: d.id || crypto.randomUUID(),
            diseaseId: d.disease_id,
            disease: d.disease,
            query: d.disease?.icd11_title || "",
            confirmedByDoctor: d.confirmed_by_doctor,
          }))
        );
      }

      const mRows = data.medications as Array<{
        drug: string;
        dosage: string;
        frequency: string;
        duration_days: number;
        instructions: string;
      }>;
      if (mRows && mRows.length > 0) {
        setMedications(
          mRows.map((m) => ({
            drug: m.drug,
            dosage: m.dosage,
            frequency: m.frequency,
            duration_days: m.duration_days,
            instructions: m.instructions || "",
          }))
        );
      }
    }
    loadDraft();
  }, [consultIdParam]);

  const handlePatientSelect = (pid: string) => {
    setSelectedPatientId(pid);
    const p = linkedPatients.find((item) => item.id === pid);
    if (p) {
      setPatientInfo({
        name: p.full_name,
        abha: p.abha_number || "",
        mobile: p.mobile || "",
        gender: p.gender || "Patient",
        bloodGroup: p.blood_group || "O+",
      });
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        drug: "",
        dosage: "",
        frequency: "bd",
        duration_days: 5,
        instructions: "After meals",
      },
    ]);
  };

  const removeMedication = (i: number) => {
    setMedications(medications.filter((_, idx) => idx !== i));
  };

  const updateMedication = (
    i: number,
    field: keyof Medication,
    value: string | number
  ) => {
    const updated = [...medications];
    updated[i] = { ...updated[i], [field]: value };
    setMedications(updated);
    if (errors[`med-${i}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`med-${i}-${field}`];
      setErrors(newErrors);
    }
  };

  const addDiagnosis = () => {
    setDiagnoses([
      ...diagnoses,
      { id: crypto.randomUUID(), query: "", confirmedByDoctor: true },
    ]);
  };

  const removeDiagnosis = (id: string) => {
    setDiagnoses(diagnoses.filter((d) => d.id !== id));
  };

  const selectDisease = (id: string, disease: DiseaseMapping) => {
    setDiagnoses(
      diagnoses.map((d) =>
        d.id === id
          ? {
              ...d,
              diseaseId: disease.id,
              disease,
              query: disease.icd11_title,
              confirmedByDoctor: true,
            }
          : d
      )
    );
    if (errors[`diag-${id}`]) {
      const newErrors = { ...errors };
      delete newErrors[`diag-${id}`];
      setErrors(newErrors);
    }
  };

  const toggleConfirmAyush = (id: string) => {
    setDiagnoses(
      diagnoses.map((d) =>
        d.id === id ? { ...d, confirmedByDoctor: !d.confirmedByDoctor } : d
      )
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedPatientId) newErrors.patient = "Please select a patient";
    if (!vitals.bp) newErrors.bp = "Blood Pressure is required";
    if (!vitals.heartRate) newErrors.heartRate = "Heart Rate is required";

    diagnoses.forEach((diag) => {
      if (!diag.disease && !diag.diseaseId) {
        newErrors[`diag-${diag.id}`] = "Please select a verified ICD-11 disease";
      }
    });

    medications.forEach((med, i) => {
      if (!med.drug.trim()) newErrors[`med-${i}-drug`] = "Drug name required";
      if (!med.dosage.trim()) newErrors[`med-${i}-dosage`] = "Dosage required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!selectedPatientId) {
      toast.error("Please pick a consented patient first");
      return;
    }
    setIsSaving(true);
    try {
      const savedId = await saveDraftMutation.mutateAsync({
        id: activeConsultId,
        patient_id: selectedPatientId,
        appointment_id: appointmentParam || undefined,
        vitals: {
          bp: vitals.bp,
          heartRate: parseInt(vitals.heartRate) || 72,
          spo2: parseInt(vitals.spo2) || 98,
          temp: parseFloat(vitals.temp) || 98.6,
          weight: parseFloat(vitals.weight) || 70,
        },
        chief_complaint: complaint,
        history,
        diagnoses: diagnoses
          .filter((d) => d.diseaseId || d.disease?.id)
          .map((d) => ({
            disease_id: d.diseaseId || d.disease!.id,
            confirmed_by_doctor: d.confirmedByDoctor,
          })),
        medications: medications
          .filter((m) => m.drug.trim())
          .map((m, idx) => ({
            drug: m.drug,
            dosage: m.dosage,
            frequency: m.frequency,
            duration_days: m.duration_days,
            instructions: m.instructions,
            sort: idx,
          })),
      });

      if (savedId) {
        setActiveConsultId(savedId);
        toast.success("Consultation draft saved successfully");
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validate()) {
      toast.error("Please resolve validation errors before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Save latest state
      const consultId = await saveDraftMutation.mutateAsync({
        id: activeConsultId,
        patient_id: selectedPatientId,
        appointment_id: appointmentParam || undefined,
        vitals: {
          bp: vitals.bp,
          heartRate: parseInt(vitals.heartRate) || 72,
          spo2: parseInt(vitals.spo2) || 98,
          temp: parseFloat(vitals.temp) || 98.6,
          weight: parseFloat(vitals.weight) || 70,
        },
        chief_complaint: complaint,
        history,
        diagnoses: diagnoses
          .filter((d) => d.diseaseId || d.disease?.id)
          .map((d) => ({
            disease_id: d.diseaseId || d.disease!.id,
            confirmed_by_doctor: d.confirmedByDoctor,
          })),
        medications: medications
          .filter((m) => m.drug.trim())
          .map((m, idx) => ({
            drug: m.drug,
            dosage: m.dosage,
            frequency: m.frequency,
            duration_days: m.duration_days,
            instructions: m.instructions,
            sort: idx,
          })),
      });

      // 2. Call publish edge function
      const res = await publishMutation.mutateAsync(consultId || activeConsultId!);
      if (res?.bundle) {
        setPublishedBundle(res.bundle);
        setShowFhirDialog(true);
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to publish consultation");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Clinical Consultation Desk</h1>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              FHIR R4 &bull; Dual AYUSH Coding
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Doctor: <span className="font-semibold text-foreground">{user?.name || "Dr. Patel"}</span> &bull; ABDM
            National Terminology Gateway Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="text-xs gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Draft
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isSaving || isPublishing}
            className="text-xs gap-1.5"
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Publish & Generate FHIR
          </Button>
        </div>
      </motion.div>

      {/* Patient Selection Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3 bg-muted/15 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Patient Identity & Consent</CardTitle>
            </div>
            <div className="w-72">
              <Select
                value={selectedPatientId}
                onValueChange={handlePatientSelect}
                disabled={patientsLoading}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select consented patient..." />
                </SelectTrigger>
                <SelectContent>
                  {linkedPatients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.full_name} ({p.abha_number || p.mobile || "Consented"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Patient Name</span>
              <span className="font-semibold text-foreground text-sm">
                {patientInfo.name || "Select patient"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">ABHA Number</span>
              <span className="font-mono text-foreground font-medium">
                {patientInfo.abha || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Mobile</span>
              <span className="font-mono text-foreground">
                {patientInfo.mobile ? `+91 ${patientInfo.mobile}` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Demographics</span>
              <span className="text-foreground">
                {patientInfo.gender} &bull; Blood: {patientInfo.bloodGroup}
              </span>
            </div>
          </div>
          {errors.patient && (
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.patient}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Vitals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive" /> Patient Vitals (LOINC / SNOMED CT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                BP (mm[Hg]) *
              </label>
              <Input
                placeholder="120/80"
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                className={errors.bp ? "border-destructive text-xs" : "text-xs"}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Heart Rate (bpm) *
              </label>
              <Input
                placeholder="72"
                value={vitals.heartRate}
                onChange={(e) =>
                  setVitals({ ...vitals, heartRate: e.target.value })
                }
                className={errors.heartRate ? "border-destructive text-xs" : "text-xs"}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                SpO2 (%)
              </label>
              <Input
                placeholder="98"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Temperature (°F)
              </label>
              <Input
                placeholder="98.6"
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Weight (kg)
              </label>
              <Input
                placeholder="70"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dual Diagnoses & AYUSH Coding */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Dual-Coded Diagnoses
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Doctor-confirmed AYUSH equivalents (NAMASTE, NUMC) mapped to ICD-11
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDiagnosis}
            className="text-xs h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Diagnosis
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {diagnoses.map((diag, i) => (
              <motion.div
                key={diag.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border rounded-xl bg-accent/5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background text-xs">
                    Diagnosis {i + 1}
                  </Badge>
                  {diagnoses.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => removeDiagnosis(diag.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>

                <DiagnosisSearchRow
                  query={diag.query}
                  onQueryChange={(q) => {
                    setDiagnoses(
                      diagnoses.map((d) => (d.id === diag.id ? { ...d, query: q } : d))
                    );
                  }}
                  onSelect={(d) => selectDisease(diag.id, d)}
                  isError={!!errors[`diag-${diag.id}`]}
                />

                {diag.disease && (
                  <div className="space-y-3 pt-1">
                    {/* AYUSH equivalents grid */}
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-lg border text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/50">
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                          Ayurveda (NAMC)
                        </div>
                        <div className="font-semibold text-xs mt-0.5">
                          {diag.disease.ayurveda_term || "None"}
                        </div>
                        <div className="text-[10px] opacity-70 font-mono mt-0.5">
                          Code: {diag.disease.ayurveda_code || "N/A"} &bull;{" "}
                          {Math.round((diag.disease.ayurveda_sim || 0) * 100)}%
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/50">
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                          Siddha (NAMC)
                        </div>
                        <div className="font-semibold text-xs mt-0.5">
                          {diag.disease.siddha_term || "None"}
                        </div>
                        <div className="text-[10px] opacity-70 font-mono mt-0.5">
                          Code: {diag.disease.siddha_code || "N/A"} &bull;{" "}
                          {Math.round((diag.disease.siddha_sim || 0) * 100)}%
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border text-violet-800 dark:text-violet-300 bg-violet-50/60 dark:bg-violet-950/20 border-violet-200/50">
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                          Unani (NUMC)
                        </div>
                        <div className="font-semibold text-xs mt-0.5">
                          {diag.disease.unani_term || "None"}
                        </div>
                        <div className="text-[10px] opacity-70 font-mono mt-0.5">
                          Code: {diag.disease.unani_code || "N/A"} &bull;{" "}
                          {Math.round((diag.disease.unani_sim || 0) * 100)}%
                        </div>
                      </div>
                    </div>

                    {/* Doctor Confirmation Checkbox (Constraint C4) */}
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-foreground">
                        <input
                          type="checkbox"
                          checked={diag.confirmedByDoctor}
                          onChange={() => toggleConfirmAyush(diag.id)}
                          className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>
                          Doctor Confirmed: Include verified AYUSH dual-codes in official FHIR bundle
                        </span>
                      </label>
                      {diag.confirmedByDoctor && (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 h-4">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Doctor Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Complaint & History */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe primary symptoms, onset, and duration..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clinical History</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Relevant past conditions, allergies, or prior treatments..."
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </CardContent>
        </Card>
      </div>

      {/* Medications */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Prescribed Medications
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedication}
            className="text-xs h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Drug
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {medications.map((m, idx) => (
            <div
              key={idx}
              className="p-3 border rounded-lg bg-card grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
            >
              <div className="sm:col-span-4">
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Drug / Formulation *
                </label>
                <Input
                  placeholder="e.g. Paracetamol 500mg or Ashwagandha Churna"
                  value={m.drug}
                  onChange={(e) => updateMedication(idx, "drug", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Dosage *
                </label>
                <Input
                  placeholder="e.g. 1 tab or 3g"
                  value={m.dosage}
                  onChange={(e) => updateMedication(idx, "dosage", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Frequency
                </label>
                <Select
                  value={m.frequency}
                  onValueChange={(val) => updateMedication(idx, "frequency", val)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="od">OD (Once daily)</SelectItem>
                    <SelectItem value="bd">BD (Twice daily)</SelectItem>
                    <SelectItem value="tds">TDS (Thrice daily)</SelectItem>
                    <SelectItem value="sos">SOS (As needed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-1">
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Days
                </label>
                <Input
                  type="number"
                  min={1}
                  value={m.duration_days}
                  onChange={(e) =>
                    updateMedication(idx, "duration_days", parseInt(e.target.value) || 1)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] text-muted-foreground block mb-1">
                  Instructions
                </label>
                <Input
                  placeholder="After meals"
                  value={m.instructions}
                  onChange={(e) =>
                    updateMedication(idx, "instructions", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                {medications.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeMedication(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* FHIR Bundle Preview Modal */}
      {publishedBundle && (
        <FhirViewer
          open={showFhirDialog}
          onOpenChange={setShowFhirDialog}
          bundle={publishedBundle}
          validation={{ ok: true, errors: [] }}
          title="HL7 FHIR R4 Bundle &bull; Published Record"
        />
      )}
    </div>
  );
}
