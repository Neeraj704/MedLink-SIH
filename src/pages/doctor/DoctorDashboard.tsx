import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  KeyRound,
  Loader2,
} from "lucide-react";
import { formatPhone, formatAadhaar, formatAbhaHpr } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDoctorStats } from "@/hooks/data/useDoctorStats";
import { useLinkedPatients } from "@/hooks/data/usePatients";
import { useAppointments } from "@/hooks/data/useAppointments";
import { useLinkPatient } from "@/hooks/data/useLinks";
import { toast } from "sonner";
import { DEMO_OTP } from "@/lib/landing-data";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useDoctorStats();
  const { data: patients = [], isLoading: patientsLoading } = useLinkedPatients();
  const { data: appointments = [] } = useAppointments("doctor");
  const linkPatient = useLinkPatient();

  // Link patient modal state
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [linkMethod, setLinkMethod] = useState("abha");
  const [linkId, setLinkId] = useState("");
  const [linkStep, setLinkStep] = useState<"id" | "otp">("id");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [linking, setLinking] = useState(false);

  const now = new Date();

  const handleRequestLink = async () => {
    if (!linkId.trim()) {
      toast.error("Please enter a valid patient identifier");
      return;
    }
    setLinking(true);
    try {
      const res = await linkPatient.mutateAsync({
        step: "request",
        identifier: linkId.trim(),
      });
      if (res.challenge_id) {
        setChallengeId(res.challenge_id);
        setLinkStep("otp");
        toast.info("Consent verification OTP dispatched to patient");
      }
    } catch {
      // Toast already surfaced by hook
    } finally {
      setLinking(false);
    }
  };

  const handleConfirmLink = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLinking(true);
    try {
      await linkPatient.mutateAsync({
        step: "confirm",
        challenge_id: challengeId,
        otp: otp.trim(),
      });
      setOpenLinkModal(false);
      setLinkStep("id");
      setLinkId("");
      setOtp("");
      setChallengeId("");
    } catch {
      // Toast already surfaced by hook
    } finally {
      setLinking(false);
    }
  };

  const statCards = [
    {
      label: "Patients Today",
      value: statsLoading ? "..." : String(statsData?.patients_today ?? patients.length),
      icon: Users,
      trend: "Active links",
    },
    {
      label: "Pending Drafts",
      value: statsLoading ? "..." : String(statsData?.pending_drafts ?? 0),
      icon: FileText,
      trend: "Draft consults",
    },
    {
      label: "Avg. Consult Time",
      value: statsLoading
        ? "..."
        : `${Math.round(statsData?.avg_consult_minutes || 14)}m`,
      icon: Clock,
      trend: "Workflow metric",
    },
    {
      label: "FHIR R4 Compliance",
      value: statsLoading ? "..." : `${statsData?.publish_rate ?? 100}%`,
      icon: TrendingUp,
      trend: "Standard compliant",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Good{" "}
          {now.getHours() < 12
            ? "Morning"
            : now.getHours() < 17
              ? "Afternoon"
              : "Evening"}
          , {user?.name || "Doctor"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          &bull; National EHR Registry Connected &bull; Consent Architecture Active
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Dialog
          open={openLinkModal}
          onOpenChange={(open) => {
            setOpenLinkModal(open);
            if (!open) {
              setLinkStep("id");
              setOtp("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Link New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Consent-First Patient Linking
              </DialogTitle>
              <DialogDescription className="text-xs">
                To access and record diagnoses, patient consent must be verified
                via OTP challenge under ABDM / NDHM guidelines.
              </DialogDescription>
            </DialogHeader>

            {linkStep === "id" ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Identifier Type
                  </label>
                  <Select value={linkMethod} onValueChange={setLinkMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select identifier type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abha">ABHA Number (14 digits)</SelectItem>
                      <SelectItem value="phone">Mobile (+91)</SelectItem>
                      <SelectItem value="aadhaar">Aadhaar Last 4 Digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Patient Identifier Value
                  </label>
                  <Input
                    placeholder={
                      linkMethod === "abha"
                        ? "91-8842-1920-3341"
                        : linkMethod === "phone"
                          ? "9876543210"
                          : "4321"
                    }
                    value={linkId}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (linkMethod === "phone") val = formatPhone(val);
                      else if (linkMethod === "aadhaar") val = formatAadhaar(val);
                      else if (linkMethod === "abha") val = formatAbhaHpr(val);
                      setLinkId(val);
                    }}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Try seeded patient Priya Sharma:{" "}
                    <button
                      type="button"
                      className="font-mono text-primary underline"
                      onClick={() => {
                        setLinkMethod("abha");
                        setLinkId("91-8842-1920-3341");
                      }}
                    >
                      91-8842-1920-3341
                    </button>
                  </p>
                </div>

                <Button
                  onClick={handleRequestLink}
                  disabled={linking || !linkId.trim()}
                  className="w-full"
                >
                  {linking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Requesting Consent...
                    </>
                  ) : (
                    "Send Consent OTP"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-primary" />
                    Enter Patient&apos;s Consent OTP
                  </div>
                  <p className="text-muted-foreground">
                    A verification code was dispatched to the mobile linked to{" "}
                    <span className="font-mono font-medium text-foreground">
                      {linkId}
                    </span>
                    . For this prototype demo, use{" "}
                    <span className="font-mono font-bold text-primary">
                      {DEMO_OTP}
                    </span>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center font-mono text-lg tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setOtp(DEMO_OTP)}
                    className="text-xs text-primary hover:underline block text-right w-full"
                  >
                    Autofill Demo OTP ({DEMO_OTP})
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLinkStep("id")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmLink}
                    disabled={linking || otp.length !== 6}
                    className="flex-1"
                  >
                    {linking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                      </>
                    ) : (
                      "Confirm Link"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Button variant="outline" asChild>
          <Link to="/doctor/consultation">
            <Stethoscope className="w-4 h-4 mr-2" /> Start Consultation Desk
          </Link>
        </Button>
      </div>

      {/* Linked Patients Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Active Consented Patients
              <Badge variant="outline" className="text-xs ml-1">
                {patients.length} linked
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/doctor/patients">
                View All Patients <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading consented patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 text-muted-foreground mx-auto" />
              <div className="text-sm font-semibold">No patients linked yet</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Use the &ldquo;Link New Patient&rdquo; button above to send a consent challenge to a patient&apos;s ABHA or mobile.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-3 font-medium">Patient</th>
                    <th className="text-left py-3 font-medium hidden sm:table-cell">
                      ABHA / ID
                    </th>
                    <th className="text-left py-3 font-medium hidden md:table-cell">
                      Last Visit / Linked
                    </th>
                    <th className="text-left py-3 font-medium">Last Diagnosis</th>
                    <th className="text-right py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 6).map((p) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 font-medium">
                        <Link
                          to={`/doctor/patients/${p.id}`}
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {p.full_name}
                        </Link>
                        {p.gender && p.blood_group && (
                          <span className="block text-[11px] text-muted-foreground">
                            {p.gender} &bull; {p.blood_group}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">
                        {p.abha_number || p.mobile || "Consented"}
                      </td>
                      <td className="py-3 text-muted-foreground hidden md:table-cell text-xs">
                        {new Date(p.last_visit).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-xs max-w-[200px] truncate">
                        <span className="text-foreground font-medium">
                          {p.last_diagnosis}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 text-xs text-primary hover:text-primary"
                        >
                          <Link to={`/doctor/consultation?patient=${p.id}`}>
                            Consult
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
