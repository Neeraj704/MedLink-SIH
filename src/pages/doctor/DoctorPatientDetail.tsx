import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  Stethoscope,
  Heart,
  Pill,
  Download,
  Shield,
  Eye,
  Activity,
} from "lucide-react";
import { usePatient } from "@/hooks/data/usePatients";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FhirViewer } from "@/components/common/FhirViewer";

interface DiagnosisItem {
  id: string;
  disease?: {
    icd11_title?: string;
    icd11_code?: string;
    ayurveda_term?: string;
    siddha_term?: string;
    unani_term?: string;
  };
}

interface MedicationItem {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions?: string;
}

interface VitalsData {
  bp?: string;
  heartRate?: number;
  spo2?: number;
  temp?: number;
  weight?: number;
}

interface ConsultationRecord {
  id: string;
  status: string;
  started_at: string;
  chief_complaint?: string;
  vitals?: VitalsData;
  consultation_diagnoses?: DiagnosisItem[];
  medications?: MedicationItem[];
}

interface DocumentItem {
  id: string;
  name: string;
  doc_type: string;
  size_bytes: number;
}

export default function DoctorPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading, error, refetch } = usePatient(id);
  const [selectedBundle, setSelectedBundle] = useState<Record<string, unknown> | null>(null);

  if (isLoading) return <PageSkeleton />;
  if (error || !patient) {
    return (
      <div className="p-6">
        <ErrorState
          title="Patient record not found"
          message="Could not load patient details or active consent link is not active."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const consultations = (patient.consultations || []) as unknown as ConsultationRecord[];
  const documents = (patient.documents || []) as unknown as DocumentItem[];
  const identifiers = patient.patient_identifiers || [];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/doctor/patients")}
            aria-label="Back to patients list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {patient.full_name}
              <Badge variant="outline" className="text-xs font-normal">
                {patient.gender || "Patient"} • {patient.blood_group || "Blood Group N/A"}
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-3 mt-0.5">
              <span>DOB: {patient.dob || "Not recorded"}</span>
              <span>•</span>
              <span>Language: {patient.preferred_language || "English"}</span>
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/doctor/consultation?patient=${patient.id}`)}
          className="gap-2"
        >
          <Stethoscope className="w-4 h-4" /> Start Consultation
        </Button>
      </div>

      {/* Identifiers Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Verified National Identifiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="text-xs text-muted-foreground block">ABHA Number</span>
              <span className="font-mono text-sm font-semibold">
                {patient.abha_number || "Not Linked"}
              </span>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="text-xs text-muted-foreground block">ABHA Address</span>
              <span className="font-mono text-sm font-semibold">
                {patient.abha_address || "Not Created"}
              </span>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="text-xs text-muted-foreground block">Phone</span>
              <span className="font-mono text-sm font-semibold">
                {patient.mobile ? `+91 ${patient.mobile}` : "Not on file"}
              </span>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="text-xs text-muted-foreground block">Consent Status</span>
              <Badge className="mt-0.5" variant="default">
                Active Consent
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline of Consultations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Consultation History & Timeline
        </h2>

        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No consultations recorded yet for this patient. Click "Start Consultation" to begin.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => {
              const diagnoses = c.consultation_diagnoses || [];
              const meds = c.medications || [];
              const vitals = c.vitals || {};

              return (
                <Card key={c.id} className="overflow-hidden">
                  <div className="p-4 sm:p-5 border-b bg-muted/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-base block">
                          {c.chief_complaint || "Routine Clinical Consultation"}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(c.started_at).toLocaleDateString([], {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          <span>•</span>
                          <Badge variant={c.status === "published" ? "default" : "secondary"} className="text-[10px] h-4">
                            {c.status.toUpperCase()}
                          </Badge>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/doctor/consultation?id=${c.id}&patient=${patient.id}`)}
                      >
                        {c.status === "draft" ? "Continue Draft" : "View Record"}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Vitals row */}
                    {vitals && Object.keys(vitals).length > 0 && (
                      <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg text-xs">
                        {vitals.bp && <span><strong className="text-foreground">BP:</strong> {vitals.bp} mm[Hg]</span>}
                        {vitals.heartRate && <span><strong className="text-foreground">HR:</strong> {vitals.heartRate} bpm</span>}
                        {vitals.spo2 && <span><strong className="text-foreground">SpO2:</strong> {vitals.spo2}%</span>}
                        {vitals.temp && <span><strong className="text-foreground">Temp:</strong> {vitals.temp}°F</span>}
                        {vitals.weight && <span><strong className="text-foreground">Weight:</strong> {vitals.weight} kg</span>}
                      </div>
                    )}

                    {/* Diagnoses */}
                    {diagnoses.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                          Dual-Coded Diagnoses
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {diagnoses.map((d) => {
                            const dis = d.disease || {};
                            return (
                              <div
                                key={d.id}
                                className="p-2.5 rounded-lg border bg-card text-xs space-y-1"
                              >
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  <span>{dis.icd11_title}</span>
                                  <Badge variant="outline" className="font-mono text-[10px]">
                                    {dis.icd11_code || "ICD-11"}
                                  </Badge>
                                </div>
                                {(dis.ayurveda_term || dis.siddha_term || dis.unani_term) && (
                                  <div className="text-muted-foreground flex gap-3 text-[11px]">
                                    {dis.ayurveda_term && <span>Ayurveda: <em>{dis.ayurveda_term}</em></span>}
                                    {dis.siddha_term && <span>Siddha: <em>{dis.siddha_term}</em></span>}
                                    {dis.unani_term && <span>Unani: <em>{dis.unani_term}</em></span>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Medications */}
                    {meds.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                          Prescribed Medications
                        </span>
                        <div className="divide-y border rounded-lg overflow-hidden text-xs">
                          {meds.map((m) => (
                            <div key={m.id} className="p-2.5 flex items-center justify-between">
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5 text-primary" /> {m.drug} ({m.dosage})
                              </span>
                              <span className="text-muted-foreground">
                                {m.frequency.toUpperCase()} • {m.duration_days} days • {m.instructions || "After meals"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared Documents */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Patient Shared Documents
        </h2>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No documents currently shared by this patient.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="font-medium text-sm block truncate">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.doc_type} • {(doc.size_bytes / 1024).toFixed(0)} KB
                  </span>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <Eye className="w-4 h-4" /> View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedBundle && (
        <FhirViewer
          open={!!selectedBundle}
          onOpenChange={() => setSelectedBundle(null)}
          bundle={selectedBundle}
        />
      )}
    </div>
  );
}
