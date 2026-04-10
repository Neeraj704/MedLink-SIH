import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, X, Clock, Download, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const appointments = [
  {
    id: 1,
    patient: "Walter White",
    date: "2026-04-10",
    time: "10:00 AM",
    type: "Follow-up",
    status: "pending",
  },
  {
    id: 2,
    patient: "Walter White",
    date: "2026-04-10",
    time: "11:30 AM",
    type: "New Consultation",
    status: "approved",
  },
  {
    id: 3,
    patient: "Amit Verma",
    date: "2026-04-11",
    time: "09:00 AM",
    type: "Lab Review",
    status: "pending",
  },
  {
    id: 4,
    patient: "Sneha Patel",
    date: "2026-04-09",
    time: "2:00 PM",
    type: "Follow-up",
    status: "completed",
  },
  {
    id: 5,
    patient: "Vikram Das",
    date: "2026-04-08",
    time: "3:30 PM",
    type: "New Consultation",
    status: "rejected",
  },
];

const consultationHistory = [
  {
    date: "2026-04-09",
    patient: "Walter White",
    diagnosis: "Gastroenteritis",
    icd: "1A3Z",
    fhir: "Published",
  },
  {
    date: "2026-04-08",
    patient: "Walter White",
    diagnosis: "Hypertension",
    icd: "BA00",
    fhir: "Draft",
  },
  {
    date: "2026-04-07",
    patient: "Amit Verma",
    diagnosis: "Migraine",
    icd: "8A80",
    fhir: "Published",
  },
  {
    date: "2026-04-06",
    patient: "Sneha Patel",
    diagnosis: "Asthma",
    icd: "CA23",
    fhir: "Published",
  },
];

export default function DoctorAppointments() {
  const [appts, setAppts] = useState(appointments);
  const [dateFilter, setDateFilter] = useState("");

  const handleAction = (id: number, action: "approved" | "rejected") => {
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a)),
    );
    toast.success(`Appointment ${action}`);
  };

  const exportCsv = () => {
    const csv = [
      "Date,Patient,Diagnosis,ICD Code,FHIR Status",
      ...consultationHistory.map(
        (r) => `${r.date},${r.patient},${r.diagnosis},${r.icd},${r.fhir}`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "consultation_history.csv";
    a.click();
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage appointments and view consultation history
        </p>
      </motion.div>

      {/* Approval list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appts.filter((a) => a.status === "pending").length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pending appointments
              </div>
            )}
            {appts.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3"
              >
                <div>
                  <div className="font-medium">{a.patient}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" /> {a.date} at {a.time} •{" "}
                    {a.type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(a.id, "approved")}
                      >
                        <Check className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(a.id, "rejected")}
                      >
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Badge
                      variant={
                        a.status === "approved"
                          ? "default"
                          : a.status === "completed"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {a.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consultation history */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Consultation History</CardTitle>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="w-4 h-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 font-medium cursor-pointer hover:text-foreground">
                    Date ↕
                  </th>
                  <th className="text-left py-3 font-medium cursor-pointer hover:text-foreground">
                    Patient ↕
                  </th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">
                    Diagnosis
                  </th>
                  <th className="text-left py-3 font-medium hidden sm:table-cell">
                    ICD-11
                  </th>
                  <th className="text-left py-3 font-medium">FHIR</th>
                </tr>
              </thead>
              <tbody>
                {consultationHistory
                  .filter((r) => !dateFilter || r.date === dateFilter)
                  .map((r, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 text-muted-foreground">{r.date}</td>
                      <td className="py-3 font-medium">{r.patient}</td>
                      <td className="py-3 hidden sm:table-cell">
                        {r.diagnosis}
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="font-mono text-xs">
                          {r.icd}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            r.fhir === "Published" ? "default" : "secondary"
                          }
                        >
                          {r.fhir}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
