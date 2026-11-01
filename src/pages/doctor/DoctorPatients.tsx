import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  User,
  Phone,
  Calendar,
  Stethoscope,
  Loader2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useLinkedPatients, useCreateWalkinPatient } from "@/hooks/data/usePatients";
import { toast } from "sonner";

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = useLinkedPatients();
  const createWalkin = useCreateWalkinPatient();
  const [search, setSearch] = useState("");

  // Walk-in modal state
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinMobile, setWalkinMobile] = useState("");
  const [walkinAbha, setWalkinAbha] = useState("");
  const [walkinGender, setWalkinGender] = useState("male");
  const [walkinDob, setWalkinDob] = useState("");

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      (p.abha_number && p.abha_number.includes(q)) ||
      (p.mobile && p.mobile.includes(q)) ||
      (p.last_diagnosis && p.last_diagnosis.toLowerCase().includes(q))
    );
  });

  const handleRegisterWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      toast.error("Patient name is required");
      return;
    }

    try {
      await createWalkin.mutateAsync({
        name: walkinName.trim(),
        mobile: walkinMobile.replace(/\D/g, "") || undefined,
        abha: walkinAbha.trim() || undefined,
        gender: walkinGender,
        dob: walkinDob || undefined,
      });
      setWalkinOpen(false);
      setWalkinName("");
      setWalkinMobile("");
      setWalkinAbha("");
      setWalkinDob("");
    } catch {
      // Error surfaced by hook toast
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Consented Patients</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Clinical records and longitudinal diagnoses authorized under patient consent
          </p>
        </div>

        {/* Walk-in patient registration modal */}
        <Dialog open={walkinOpen} onOpenChange={setWalkinOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" /> Register Walk-in Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Register Walk-in Patient
              </DialogTitle>
              <DialogDescription className="text-xs">
                Creates an unclaimed clinical record linked to your desk. The patient
                can later claim and verify this record using their mobile number.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterWalkin} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Mobile Number
                  </label>
                  <Input
                    placeholder="10 digits"
                    value={walkinMobile}
                    maxLength={10}
                    onChange={(e) => setWalkinMobile(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Gender
                  </label>
                  <Select value={walkinGender} onValueChange={setWalkinGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={walkinDob}
                    onChange={(e) => setWalkinDob(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    ABHA Number (Optional)
                  </label>
                  <Input
                    placeholder="14-digit ABHA"
                    value={walkinAbha}
                    onChange={(e) => setWalkinAbha(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createWalkin.isPending}
                className="w-full mt-2"
              >
                {createWalkin.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...
                  </>
                ) : (
                  "Create Walk-in Record"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, ABHA ID, mobile, or condition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patient List */}
      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading patients...
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground space-y-2">
              <User className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <div className="text-sm font-semibold">No patients found</div>
              <p className="text-xs">
                {search
                  ? `No matching patient records found for "${search}"`
                  : "Link a patient using their ABHA number or register a walk-in patient above."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((p) => (
            <Card
              key={p.id}
              className="card-hover transition-colors border-border hover:border-primary/40 cursor-pointer"
              onClick={() => navigate(`/doctor/patients/${p.id}`)}
            >
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {p.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{p.full_name}</span>
                      <Badge variant="outline" className="text-[10px] h-4 font-mono">
                        {p.gender || "Patient"}
                      </Badge>
                      <Badge
                        variant={p.status === "active" ? "default" : "secondary"}
                        className="text-[10px] h-4"
                      >
                        {p.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5 flex flex-wrap items-center gap-3">
                      <span>ABHA: {p.abha_number || "Not assigned"}</span>
                      {p.mobile && <span>Mobile: +91 {p.mobile}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-foreground font-medium block truncate max-w-[180px]">
                      {p.last_diagnosis}
                    </span>
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.last_visit).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/patients/${p.id}`);
                      }}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" /> Records
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/consultation?patient=${p.id}`);
                      }}
                    >
                      <Stethoscope className="w-3.5 h-3.5 mr-1" /> Consult
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
