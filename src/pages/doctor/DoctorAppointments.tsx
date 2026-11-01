import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Check,
  X,
  Clock,
  Download,
  Filter,
  Loader2,
  Stethoscope,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useAppointments,
  useRespondAppointment,
} from "@/hooks/data/useAppointments";
import { useConsultations } from "@/hooks/data/useConsultations";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export default function DoctorAppointments() {
  const { data: appointments = [], isLoading: apptsLoading } = useAppointments("doctor");
  const { data: consultations = [], isLoading: consultsLoading } = useConsultations();
  const respondMutation = useRespondAppointment();

  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAppts = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (dateFilter) {
        const aDate = new Date(a.starts_at).toISOString().split("T")[0];
        if (aDate !== dateFilter) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, dateFilter]);

  const handleAction = async (id: string, decision: "approved" | "rejected") => {
    try {
      await respondMutation.mutateAsync({
        appointment_id: id,
        decision,
      });
    } catch {
      // Toast surfaced by mutation hook
    }
  };

  const handleExportCsv = () => {
    if (consultations.length === 0) {
      toast.info("No consultation records available for export");
      return;
    }

    const rows = consultations.map((c) => {
      const diag = c.consultation_diagnoses?.[0]?.disease;
      return {
        Date: new Date(c.started_at).toLocaleDateString(),
        Patient: c.patient?.full_name || "Unknown Patient",
        ABHA: c.patient?.abha_number || "N/A",
        Diagnosis: diag?.icd11_title || "General Checkup",
        ICD11_Code: diag?.icd11_code || "N/A",
        Ayurveda_Term: diag?.ayurveda_term || "N/A",
        Status: c.status,
        Duration_Minutes: Math.round((c.duration_seconds || 600) / 60),
      };
    });

    downloadCsv(`medlink_consultation_history_${new Date().toISOString().split("T")[0]}.csv`, rows);
    toast.success("Consultation history CSV exported");
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Appointments & Clinical Log</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review appointment requests, manage schedules, and audit consultation logs
        </p>
      </motion.div>

      {/* Appointment requests */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Patient Appointment Requests
              <Badge variant="outline" className="text-xs ml-1">
                {appointments.filter((a) => a.status === "pending").length} pending
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {apptsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading appointments...
            </div>
          ) : filteredAppts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No appointments matching criteria
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppts.map((a) => {
                const startsAt = new Date(a.starts_at);
                const dateStr = startsAt.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStr = startsAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3 bg-card"
                  >
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{a.patient?.full_name || "Patient"}</span>
                        {a.patient?.abha_number && (
                          <span className="font-mono text-xs text-muted-foreground">
                            ({a.patient.abha_number})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-3.5 h-3.5" /> {dateStr} at {timeStr} &bull;{" "}
                        <span className="font-medium text-foreground">{a.type}</span>
                        {a.notes && <span>&bull; &ldquo;{a.notes}&rdquo;</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {a.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleAction(a.id, "approved")}
                            disabled={respondMutation.isPending}
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 hover:text-destructive"
                            onClick={() => handleAction(a.id, "rejected")}
                            disabled={respondMutation.isPending}
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              a.status === "approved"
                                ? "default"
                                : a.status === "completed"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {a.status.toUpperCase()}
                          </Badge>
                          {a.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-7 text-xs text-primary"
                            >
                              <Link
                                to={`/doctor/consultation?patient=${a.patient_id}&appointment=${a.id}`}
                              >
                                Start Consult
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Consultation History Log</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Archived clinical sessions with dual AYUSH and ICD-11 coding
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-36 h-8 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {consultsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading history...
            </div>
          ) : consultations.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No consultations recorded yet. Start a consultation from the desk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs font-semibold">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Patient</th>
                    <th className="text-left py-3 hidden sm:table-cell">Diagnosis</th>
                    <th className="text-left py-3 hidden sm:table-cell">ICD-11</th>
                    <th className="text-left py-3 hidden md:table-cell">Ayurveda</th>
                    <th className="text-right py-3">FHIR Status</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations
                    .filter((c) => {
                      if (!dateFilter) return true;
                      return (
                        new Date(c.started_at).toISOString().split("T")[0] ===
                        dateFilter
                      );
                    })
                    .map((c) => {
                      const diag = c.consultation_diagnoses?.[0]?.disease;
                      return (
                        <tr
                          key={c.id}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 text-xs text-muted-foreground">
                            {new Date(c.started_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 font-medium text-xs">
                            <Link
                              to={`/doctor/patients/${c.patient_id}`}
                              className="hover:text-primary hover:underline"
                            >
                              {c.patient?.full_name || "Patient"}
                            </Link>
                          </td>
                          <td className="py-3 text-xs hidden sm:table-cell">
                            {diag?.icd11_title || c.chief_complaint || "Consultation"}
                          </td>
                          <td className="py-3 text-xs font-mono hidden sm:table-cell">
                            {diag?.icd11_code ? (
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {diag.icd11_code}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground hidden md:table-cell">
                            {diag?.ayurveda_term || "-"}
                          </td>
                          <td className="py-3 text-right">
                            <Badge
                              variant={c.status === "published" ? "default" : "secondary"}
                              className="text-[10px]"
                            >
                              {c.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
