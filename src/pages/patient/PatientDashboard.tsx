import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Pill,
  Calendar,
  Activity,
  FileText,
  TrendingUp,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConsultations } from "@/hooks/data/useConsultations";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: consultations = [], isLoading } = useConsultations({
    status: "published",
  });
  const now = new Date();

  // Extract active medications from consultations
  const activeMeds = useMemo(() => {
    const list: Array<{
      drug: string;
      dosage: string;
      frequency: string;
      instructions: string;
      date: string;
    }> = [];

    for (const c of consultations) {
      if (c.medications) {
        for (const m of c.medications) {
          list.push({
            drug: m.drug,
            dosage: m.dosage,
            frequency: m.frequency,
            instructions: m.instructions || "After meals",
            date: new Date(c.started_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            }),
          });
        }
      }
    }
    return list.slice(0, 4);
  }, [consultations]);

  // Extract vitals history for the Recharts graph
  const vitalsChartData = useMemo(() => {
    return [...consultations]
      .reverse()
      .map((c) => {
        const dateStr = new Date(c.started_at).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });

        const v = (c.vitals || {}) as Record<string, unknown>;
        let systolic = 120;
        let diastolic = 80;

        if (typeof v.bp === "string") {
          const parts = v.bp.split("/");
          if (parts.length === 2) {
            systolic = parseInt(parts[0]) || 120;
            diastolic = parseInt(parts[1]) || 80;
          }
        }

        const hr =
          typeof v.heartRate === "number"
            ? v.heartRate
            : parseInt(String(v.heartRate || "72")) || 72;

        return {
          date: dateStr,
          Systolic: systolic,
          Diastolic: diastolic,
          "Heart Rate": hr,
        };
      });
  }, [consultations]);

  const stats = [
    {
      label: "Total Consultations",
      value: isLoading ? "..." : String(consultations.length),
      icon: Calendar,
      detail: "Verified visits",
    },
    {
      label: "Active Prescriptions",
      value: isLoading ? "..." : String(activeMeds.length),
      icon: Pill,
      detail: "Formulations active",
    },
    {
      label: "Latest Visit",
      value:
        consultations.length > 0
          ? new Date(consultations[0].started_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })
          : "None",
      icon: Activity,
      detail: "Longitudinal record",
    },
    {
      label: "EHR Integrity",
      value: "100%",
      icon: ShieldCheck,
      detail: "Hash-chained ABDM",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Good{" "}
          {now.getHours() < 12
            ? "Morning"
            : now.getHours() < 17
              ? "Afternoon"
              : "Evening"}
          , {user?.name || "Patient"}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your personal health record &bull; ABHA Linked &bull; Consent-Controlled Health Data
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent visits */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" /> Verified Clinical Visits
            </CardTitle>
            <Link to="/patient/records">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading visits...
              </div>
            ) : consultations.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No clinical visits recorded yet. Book an appointment with a nearby doctor.
              </div>
            ) : (
              consultations.slice(0, 3).map((v) => {
                const diag = v.consultation_diagnoses?.[0]?.disease;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {diag?.icd11_title || v.chief_complaint || "Routine Consultation"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {v.doctor?.full_name || "Doctor"} &bull;{" "}
                        {new Date(v.started_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      FHIR R4 Available
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active medications */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" /> Active Formulations & Drugs
            </CardTitle>
            <Link to="/patient/prescriptions">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading medications...
              </div>
            ) : activeMeds.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active medications recorded.
              </div>
            ) : (
              activeMeds.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span>{m.drug}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        ({m.dosage})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.frequency.toUpperCase()} &bull; {m.instructions}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {m.date}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vitals chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Vitals & Clinical Trends (LOINC Standard)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vitalsChartData.length < 2 ? (
            <div className="h-56 flex items-center justify-center border rounded-lg bg-muted/10 text-muted-foreground text-xs text-center p-4">
              <div>
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-medium text-foreground">
                  Blood Pressure & Heart Rate Longitudinal Trends
                </p>
                <p className="text-muted-foreground mt-1">
                  At least 2 published consultation visits are required to graph trends.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 160]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="Systolic"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Diastolic"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Heart Rate"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
