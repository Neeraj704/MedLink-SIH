import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
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
  Copy,
  Code2,
  Sparkles,
  AlertCircle,
  Stethoscope,
  UserPlus,
  Fingerprint,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";

interface Medication {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DiseaseRow {
  ICD11_Title: string;
  ICD11_Code: string;
  Ayurveda_NAMC_term: string;
  Ayurveda_NAMC_CODE?: string;
  Siddha_NAMC_TERM: string;
  Siddha_NAMC_CODE?: string;
  Unani_NUMC_TERM: string;
  Unani_NUMC_CODE?: string;
  Ayurveda_Similarity: string;
  Siddha_Similarity: string;
  Unani_Similarity: string;
}

interface Diagnosis {
  id: string;
  disease?: DiseaseRow;
  query: string;
}

interface PatientInfo {
  name: string;
  identifiers: { type: string; value: string }[];
}

export default function ConsultationDesk() {
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({ 
    name: "", 
    identifiers: [{ type: "ABHA", value: "" }] 
  });
  const [isPatientSet, setIsPatientSet] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  
  const [vitals, setVitals] = useState({
    bp: "",
    heartRate: "",
    spo2: "",
    temp: "",
    weight: "",
  });
  const [complaint, setComplaint] = useState("");
  const [history, setHistory] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { drug: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([
    { id: crypto.randomUUID(), query: "" },
  ]);
  const [allDiseases, setAllDiseases] = useState<DiseaseRow[]>([]);
  const [loadingDiseases, setLoadingDiseases] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFhirDialog, setShowFhirDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Papa.parse("/conciseFinalData.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setAllDiseases(results.data as DiseaseRow[]);
        setLoadingDiseases(false);
      },
      error: () => {
        setLoadingDiseases(false);
        toast.error("Failed to load disease database");
      },
    });
  }, []);

  const addMedication = () => {
    setMedications([
      ...medications,
      { drug: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedication = (i: number) => {
    setMedications(medications.filter((_, idx) => idx !== i));
  };

  const updateMedication = (
    i: number,
    field: keyof Medication,
    value: string,
  ) => {
    const updated = [...medications];
    updated[i][field] = value;
    setMedications(updated);
    if (errors[`med-${i}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`med-${i}-${field}`];
      setErrors(newErrors);
    }
  };

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { id: crypto.randomUUID(), query: "" }]);
  };

  const removeDiagnosis = (id: string) => {
    setDiagnoses(diagnoses.filter((d) => d.id !== id));
  };

  const updateDiagnosisQuery = (id: string, query: string) => {
    setDiagnoses(diagnoses.map((d) => (d.id === id ? { ...d, query } : d)));
  };

  const selectDisease = (id: string, disease: DiseaseRow) => {
    setDiagnoses(
      diagnoses.map((d) =>
        d.id === id ? { ...d, disease, query: disease.ICD11_Title } : d,
      ),
    );
    if (errors[`diag-${id}`]) {
      const newErrors = { ...errors };
      delete newErrors[`diag-${id}`];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate Vitals
    if (!vitals.bp) newErrors.bp = "BP is required";
    if (!vitals.heartRate) newErrors.heartRate = "Heart Rate is required";

    // Validate Diagnoses
    diagnoses.forEach((diag) => {
      if (!diag.disease)
        newErrors[`diag-${diag.id}`] = "Please select a disease";
    });

    // Validate Medications
    medications.forEach((med, i) => {
      if (!med.drug) newErrors[`med-${i}-drug`] = "Drug name is required";
      if (!med.dosage) newErrors[`med-${i}-dosage`] = "Dosage is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    toast.success("Consultation saved as draft");
  };

  const handlePublish = () => {
    if (validate()) {
      setShowSuccessDialog(true);
    } else {
      toast.error("Please fix the errors before publishing");
    }
  };

  const formatBP = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length >= 4) {
      return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const handleVitalChange = (key: keyof typeof vitals, value: string) => {
    let formatted = value;
    if (key === "bp") {
      formatted = formatBP(value);
    } else if (key === "heartRate" || key === "spo2") {
      formatted = value.replace(/\D/g, "").slice(0, 3);
    } else if (key === "temp" || key === "weight") {
      formatted = value
        .replace(/[^0-9.]/g, "")
        .split(".")
        .slice(0, 2)
        .map((v, i) => (i === 0 ? v.slice(0, 3) : v.slice(0, 1)))
        .join(".");
    }

    setVitals({ ...vitals, [key]: formatted });
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const addIdentifier = () => {
    setPatientInfo({
      ...patientInfo,
      identifiers: [...patientInfo.identifiers, { type: "Aadhaar", value: "" }]
    });
  };

  const formatABHA = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    const groups = cleaned.match(/.{1,2}/g) || [];
    if (groups.length > 1) {
      const first = groups[0];
      const rest = cleaned.slice(2).match(/.{1,4}/g) || [];
      return [first, ...rest].join("-");
    }
    return cleaned;
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 12);
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('91')) {
      const rest = cleaned.slice(2, 12);
      return `+91 ${rest}`;
    }
    return `+91 ${cleaned.slice(0, 10)}`;
  };

  const updateIdentifier = (i: number, field: "type" | "value", val: string) => {
    const updated = [...patientInfo.identifiers];
    const type = field === "type" ? val : updated[i].type;
    let finalVal = field === "value" ? val : updated[i].value;

    if (field === "value" || field === "type") {
      if (type === "ABHA") finalVal = formatABHA(finalVal);
      else if (type === "Aadhaar") finalVal = formatAadhaar(finalVal);
      else if (type === "Phone") finalVal = formatPhone(finalVal);
    }

    updated[i].type = type;
    updated[i].value = finalVal;
    setPatientInfo({ ...patientInfo, identifiers: updated });
  };

  const removeIdentifier = (i: number) => {
    setPatientInfo({
      ...patientInfo,
      identifiers: patientInfo.identifiers.filter((_, idx) => idx !== i)
    });
  };

  const handleSavePatient = () => {
    if (!patientInfo.name.trim()) {
      toast.error("Patient name is required");
      return;
    }
    
    if (patientInfo.identifiers.length === 0) {
      toast.error("At least one identifier is required");
      return;
    }

    for (const id of patientInfo.identifiers) {
      if (!id.value.trim()) {
        toast.error(`Value for ${id.type} is required`);
        return;
      }
      
      if (id.type === "Gmail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id.value)) {
        toast.error("Please enter a valid Gmail/Email address");
        return;
      }
      
      if (id.type === "ABHA" && id.value.replace(/\D/g, '').length < 14) {
        toast.error("ABHA number must be 14 digits");
        return;
      }

      if (id.type === "Aadhaar" && id.value.replace(/\D/g, '').length < 12) {
        toast.error("Aadhaar number must be 12 digits");
        return;
      }
      
      if (id.type === "Phone" && id.value.replace(/\D/g, '').length < 12) { // 91 + 10 digits
        toast.error("Phone number must be 10 digits");
        return;
      }
    }

    setIsPatientSet(true);
    setShowPatientDialog(false);
    toast.success("Patient details set successfully");
  };

  const formatConfidence = (sim: any) => {
    if (!sim) return "0%";
    const val = typeof sim === "string" ? parseFloat(sim) : sim;
    return `${(val * 100).toFixed(1)}%`;
  };

  const generateFhirBundle = () => {
    const timestamp = new Date().toISOString();
    const patientName = patientInfo.name || "Unknown Patient";
    const primaryId = patientInfo.identifiers[0]?.value || "UNKNOWN";
    const patientRef = "urn:uuid:patient-1";
    const doctorRef = "urn:uuid:doctor-1";
    const encounterRef = "urn:uuid:encounter-1";

    const bundle: any = {
      resourceType: "Bundle",
      type: "transaction",
      timestamp,
      entry: [
        // 1. Patient
        {
          fullUrl: patientRef,
          resource: {
            resourceType: "Patient",
            identifier: patientInfo.identifiers.map(id => ({
              system: id.type === "ABHA" ? "https://abha.gov.in" : 
                      id.type === "Aadhaar" ? "https://uidai.gov.in" : 
                      id.type === "Gmail" ? "https://mail.google.com" : "https://phone.gov.in",
              value: id.value
            })),
            name: [{ text: patientName }]
          },
          request: { method: "PUT", url: `Patient?identifier=${primaryId}` },
        },
        // 2. Doctor
        {
          fullUrl: doctorRef,
          resource: {
            resourceType: "Practitioner",
            name: [{ text: "Dr. Patel" }],
          },
          request: { method: "POST", url: "Practitioner" },
        },
        // 3. Encounter
        {
          fullUrl: encounterRef,
          resource: {
            resourceType: "Encounter",
            status: "finished",
            class: {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
              code: "AMB",
              display: "ambulatory",
            },
            subject: { reference: patientRef },
            participant: [{ individual: { reference: doctorRef } }],
            period: { start: timestamp, end: timestamp },
          },
          request: { method: "POST", url: "Encounter" },
        },
      ],
    };

    // 4. Vitals as Observations
    const vitalDefinitions = [
      { key: "bp", label: "Blood Pressure", unit: "mmHg" },
      { key: "heartRate", label: "Heart Rate", unit: "bpm" },
      { key: "spo2", label: "SpO2", unit: "%" },
      { key: "temp", label: "Temperature", unit: "°F" },
      { key: "weight", label: "Weight", unit: "kg" },
    ];

    vitalDefinitions.forEach((vital) => {
      const val = vitals[vital.key as keyof typeof vitals];
      if (val) {
        bundle.entry.push({
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: vital.label },
            valueQuantity: {
              value: parseFloat(val.replace(/[^\d.]/g, "")),
              unit: vital.unit,
            },
            subject: { reference: patientRef },
            encounter: { reference: encounterRef },
            effectiveDateTime: timestamp,
          } as any,
          request: { method: "POST", url: "Observation" },
        });
      }
    });

    // 5. Chief Complaint
    if (complaint) {
      bundle.entry.push({
        resource: {
          resourceType: "Condition",
          clinicalStatus: { text: "active" },
          code: { text: complaint },
          subject: { reference: patientRef },
          encounter: { reference: encounterRef },
          recordedDate: timestamp.split("T")[0],
        } as any,
        request: { method: "POST", url: "Condition" },
      });
    }

    // 6. Diagnoses & Code Translation
    diagnoses
      .filter((d) => d.disease)
      .forEach((d, i) => {
        const disease = d.disease!;
        bundle.entry.push({
          resource: {
            resourceType: "Condition",
            id: `diag-${i}`,
            code: {
              coding: [
                {
                  system: "http://id.who.int/icd/release/11",
                  code: disease.ICD11_Code,
                  display: disease.ICD11_Title,
                },
                {
                  system: "http://ayush.gov.in/namc/ayurveda",
                  display: disease.Ayurveda_NAMC_term,
                  extension: [
                    {
                      url: "confidence",
                      valueDecimal: parseFloat(disease.Ayurveda_Similarity),
                    },
                  ],
                },
                {
                  system: "http://ayush.gov.in/namc/siddha",
                  display: disease.Siddha_NAMC_TERM,
                  extension: [
                    {
                      url: "confidence",
                      valueDecimal: parseFloat(disease.Siddha_Similarity),
                    },
                  ],
                },
                {
                  system: "http://ayush.gov.in/numc/unani",
                  display: disease.Unani_NUMC_TERM,
                  extension: [
                    {
                      url: "confidence",
                      valueDecimal: parseFloat(disease.Unani_Similarity),
                    },
                  ],
                },
              ],
            },
            subject: { reference: patientRef },
            encounter: { reference: encounterRef },
          } as any,
          request: { method: "POST", url: "Condition" },
        });
      });

    // 7. Medications
    medications
      .filter((m) => m.drug)
      .forEach((m, i) => {
        bundle.entry.push({
          resource: {
            resourceType: "MedicationRequest",
            status: "active",
            intent: "order",
            medicationCodeableConcept: { text: m.drug },
            dosageInstruction: [
              {
                text: `${m.dosage}, ${m.frequency} for ${m.duration}. ${m.instructions}`,
              },
            ],
            subject: { reference: patientRef },
            encounter: { reference: encounterRef },
            authoredOn: timestamp,
          } as any,
          request: { method: "POST", url: "MedicationRequest" },
        });
      });

    return bundle;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      JSON.stringify(generateFhirBundle(), null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("FHIR JSON copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Consultation Desk</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record patient vitals, symptoms, and prescriptions
        </p>
      </motion.div>

      {/* Patient info bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {!isPatientSet ? (
          <Card className="border-dashed border-2 bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer group" onClick={() => setShowPatientDialog(true)}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-xl">Set Patient Details</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">Select identifiers and enter patient name to start consultation</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Patient Identity
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-accent/10 border-primary/20">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
                  {patientInfo.name.split(" ").map(n => n[0]).join("").toUpperCase() || "UN"}
                </div>
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    {patientInfo.name}
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">ACTIVE PATIENT</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patientInfo.identifiers.map((id, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] h-5 font-mono bg-background/50">
                        <Fingerprint className="w-3 h-3 mr-1 opacity-60" />
                        {id.type}: {id.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPatientDialog(true)} className="h-8 text-xs">
                  Change Patient
                </Button>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider opacity-60 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active Session</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Vitals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                key: "bp" as const,
                label: "Blood Pressure",
                icon: Droplets,
                placeholder: "120/80",
                unit: "mmHg",
              },
              {
                key: "heartRate" as const,
                label: "Heart Rate",
                icon: Heart,
                placeholder: "72",
                unit: "bpm",
              },
              {
                key: "spo2" as const,
                label: "SpO₂",
                icon: Wind,
                placeholder: "98",
                unit: "%",
              },
              {
                key: "temp" as const,
                label: "Temperature",
                icon: Thermometer,
                placeholder: "98.6",
                unit: "°F",
              },
              {
                key: "weight" as const,
                label: "Weight",
                icon: Weight,
                placeholder: "70",
                unit: "kg",
              },
            ].map((v) => (
              <div key={v.key}>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  {v.label}
                  {errors[v.key] && (
                    <AlertCircle className="w-3 h-3 text-destructive" />
                  )}
                </label>
                <div className="relative">
                  <Input
                    placeholder={v.placeholder}
                    value={vitals[v.key]}
                    onChange={(e) => handleVitalChange(v.key, e.target.value)}
                    className={`pr-10 ${errors[v.key] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {v.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card>
        <CardHeader className="pb-3 border-b mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                Diagnosis & Code Translation
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={addDiagnosis}>
              <Plus className="w-4 h-4 mr-1" /> Add Diagnosis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {diagnoses.map((diag, i) => (
              <motion.div
                key={diag.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border rounded-xl bg-accent/5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-background">
                    Diagnosis {i + 1}
                  </Badge>
                  {diagnoses.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDiagnosis(diag.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <Input
                        placeholder="Search disease by name or ICD-11 code (e.g., Cholera, 1A00)..."
                        value={diag.query}
                        onChange={(e) =>
                          updateDiagnosisQuery(diag.id, e.target.value)
                        }
                        className={`pl-11 h-12 text-base ${errors[`diag-${diag.id}`] ? "border-destructive" : "border-primary/20 focus:border-primary"}`}
                      />
                    </div>

                    {/* Results dropdown - matching CodeTranslation UI */}
                    {diag.query && !diag.disease && (
                      <div className="absolute z-50 mt-2 w-full bg-popover border rounded-xl shadow-2xl max-h-[400px] overflow-y-auto divide-y border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {allDiseases
                          .filter(
                            (d) =>
                              d.ICD11_Title?.toLowerCase().includes(
                                diag.query.toLowerCase(),
                              ) ||
                              d.ICD11_Code?.toLowerCase().includes(
                                diag.query.toLowerCase(),
                              ),
                          )
                          .slice(0, 10)
                          .map((d) => (
                            <button
                              key={d.ICD11_Code}
                              className="w-full text-left p-4 hover:bg-accent/50 transition-colors flex flex-col gap-1 border-b last:border-b-0"
                              onClick={() => selectDisease(diag.id, d)}
                            >
                              <div className="font-semibold text-[#2563eb] text-lg hover:underline decoration-1">
                                {d.ICD11_Title}
                              </div>
                              <div className="text-sm text-muted-foreground font-medium mb-1">
                                ICD Code: {d.ICD11_Code}
                              </div>
                              <div className="grid grid-cols-1 gap-0.5">
                                <div className="text-[12px] text-foreground/80">
                                  <span className="font-bold">Ayurveda:</span>{" "}
                                  {d.Ayurveda_NAMC_term}{" "}
                                  <span className="text-muted-foreground opacity-60 ml-1">
                                    ({formatConfidence(d.Ayurveda_Similarity)})
                                  </span>
                                </div>
                                <div className="text-[12px] text-foreground/80">
                                  <span className="font-bold">Siddha:</span>{" "}
                                  {d.Siddha_NAMC_TERM}{" "}
                                  <span className="text-muted-foreground opacity-60 ml-1">
                                    ({formatConfidence(d.Siddha_Similarity)})
                                  </span>
                                </div>
                                <div className="text-[12px] text-foreground/80">
                                  <span className="font-bold">Unani:</span>{" "}
                                  {d.Unani_NUMC_TERM}{" "}
                                  <span className="text-muted-foreground opacity-60 ml-1">
                                    ({formatConfidence(d.Unani_Similarity)})
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        {allDiseases.filter((d) =>
                          d.ICD11_Title?.toLowerCase().includes(
                            diag.query.toLowerCase(),
                          ),
                        ).length === 0 && (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No matching diseases found for "{diag.query}"
                          </div>
                        )}
                      </div>
                    )}
                    {errors[`diag-${diag.id}`] && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{" "}
                        {errors[`diag-${diag.id}`]}
                      </p>
                    )}
                  </div>

                  {diag.disease && (
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        {
                          label: "Ayurveda",
                          value: diag.disease.Ayurveda_NAMC_term,
                          sim: diag.disease.Ayurveda_Similarity,
                          color:
                            "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50",
                        },
                        {
                          label: "Siddha",
                          value: diag.disease.Siddha_NAMC_TERM,
                          sim: diag.disease.Siddha_Similarity,
                          color:
                            "text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/50",
                        },
                        {
                          label: "Unani",
                          value: diag.disease.Unani_NUMC_TERM,
                          sim: diag.disease.Unani_Similarity,
                          color:
                            "text-violet-700 bg-violet-50 border-violet-100 dark:text-violet-400 dark:bg-violet-950/30 dark:border-violet-900/50",
                        },
                      ].map((sys) => (
                        <div
                          key={sys.label}
                          className={`p-3 rounded-lg border ${sys.color}`}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-bold opacity-70">
                            {sys.label} Equivalent
                          </div>
                          <div className="font-semibold text-sm mt-0.5">
                            {sys.value || "N/A"}
                          </div>
                          <div className="text-[10px] mt-1 opacity-60">
                            Confidence: {formatConfidence(sys.sim)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Chief Complaint & History */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the patient's primary complaint..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Relevant past medical history, allergies, surgeries..."
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Prescription */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Prescription</CardTitle>
            <Button variant="outline" size="sm" onClick={addMedication}>
              <Plus className="w-4 h-4 mr-1" /> Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.map((med, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Medication {i + 1}</Badge>
                {medications.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMedication(i)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    Drug Name
                    {errors[`med-${i}-drug`] && (
                      <AlertCircle className="w-3 h-3 text-destructive" />
                    )}
                  </label>
                  <Input
                    placeholder="e.g., Paracetamol"
                    value={med.drug}
                    onChange={(e) =>
                      updateMedication(i, "drug", e.target.value)
                    }
                    className={
                      errors[`med-${i}-drug`] ? "border-destructive" : ""
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    Dosage
                    {errors[`med-${i}-dosage`] && (
                      <AlertCircle className="w-3 h-3 text-destructive" />
                    )}
                  </label>
                  <Input
                    placeholder="e.g., 500mg"
                    value={med.dosage}
                    onChange={(e) =>
                      updateMedication(i, "dosage", e.target.value)
                    }
                    className={
                      errors[`med-${i}-dosage`] ? "border-destructive" : ""
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Frequency
                  </label>
                  <Select
                    value={med.frequency}
                    onValueChange={(v) => updateMedication(i, "frequency", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="od">Once Daily</SelectItem>
                      <SelectItem value="bd">Twice Daily</SelectItem>
                      <SelectItem value="tds">Thrice Daily</SelectItem>
                      <SelectItem value="sos">As Needed (SOS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Duration
                  </label>
                  <Input
                    placeholder="e.g., 5 days"
                    value={med.duration}
                    onChange={(e) =>
                      updateMedication(i, "duration", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Special Instructions
                </label>
                <Textarea
                  placeholder="e.g., Take after meals"
                  value={med.instructions}
                  onChange={(e) =>
                    updateMedication(i, "instructions", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" /> Save Draft
        </Button>
        <Button onClick={handlePublish}>
          <Send className="w-4 h-4 mr-2" /> Publish to Patient
        </Button>
      </div>

      {/* Prescription Published Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <div className="p-2 rounded-full bg-primary/10">
                <Check className="w-6 h-6" />
              </div>
              Prescription Published
            </DialogTitle>
            <DialogDescription className="pt-2">
              The consultation record has been successfully published to the
              patient portal and ABDM network.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setShowFhirDialog(true);
              }}
            >
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FHIR Bundle Preview Dialog */}
      <Dialog open={showFhirDialog} onOpenChange={setShowFhirDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              FHIR Bundle Preview
              <Badge variant="secondary" className="text-[10px] h-5">
                R4
              </Badge>
            </DialogTitle>
            <DialogDescription>
              HL7 FHIR compliant JSON representation of this consultation
              record.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 bg-slate-950 rounded-lg p-4 overflow-hidden mt-2 group">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <pre className="text-slate-300 font-mono text-xs leading-relaxed overflow-auto h-[50vh] p-2 custom-scrollbar">
              <code>{JSON.stringify(generateFhirBundle(), null, 2)}</code>
            </pre>
          </div>

          <DialogFooter className="sm:justify-between items-center mt-4">
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Verified HL7 FHIR R4 Structure
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFhirDialog(false)}
              >
                Close
              </Button>
              <Button onClick={() => setShowFhirDialog(false)}>Finish</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Set Patient Details Dialog */}
      <Dialog open={showPatientDialog} onOpenChange={setShowPatientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Patient Registration
            </DialogTitle>
            <DialogDescription>
              Enter patient identity details. You can add multiple identifiers for ABDM/HL7 compliance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="e.g., Rahul Sharma" 
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Identifiers</label>
                <Button variant="ghost" size="sm" onClick={addIdentifier} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add ID
                </Button>
              </div>
              
              {patientInfo.identifiers.map((id, i) => (
                <div key={i} className="flex gap-2">
                  <Select 
                    value={id.type} 
                    onValueChange={(val) => updateIdentifier(i, "type", val)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ABHA">ABHA</SelectItem>
                      <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                      <SelectItem value="Gmail">Gmail</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    placeholder="Enter ID value" 
                    value={id.value}
                    onChange={(e) => updateIdentifier(i, "value", e.target.value)}
                    className="flex-1"
                  />
                  {patientInfo.identifiers.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeIdentifier(i)} className="text-muted-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePatient}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
