import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  Loader2,
  Stethoscope,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/data/useProfile";
import { toast } from "sonner";

export default function DoctorProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [clinicName, setClinicName] = useState("");
  const [experienceYears, setExperienceYears] = useState(10);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setPreferredLanguage(profile.preferred_language || "English");
      if (profile.doctor_details) {
        setSpecializations(profile.doctor_details.specializations || []);
        setClinicName(profile.doctor_details.clinic_name || "");
        setExperienceYears(profile.doctor_details.experience_years || 10);
      }
    } else if (user) {
      setName(user.name || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        full_name: name.trim(),
        preferred_language: preferredLanguage,
        specializations,
        clinic_name: clinicName,
      });
    } catch {
      // Toast surfaced by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading doctor profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Doctor Identity & Credentials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your ABDM Healthcare Professional Registry (HPR) identity and verified credentials
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left card */}
        <Card className="lg:col-span-1 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4 border-2 border-primary/20">
              {name?.charAt(0) || "D"}
            </div>
            <h3 className="font-semibold text-lg">{name || "Dr. Practitioner"}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {specializations.join(" • ") || "AYUSH & Allopathic Medicine"}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                <Shield className="w-3 h-3 mr-1" /> HPR Verified
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Active Practitioner
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t text-left text-xs space-y-2.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>HPR ID</span>
                <span className="font-mono text-foreground font-medium">
                  {profile?.hpr_id || user?.identifier || "HPR-1234-5678"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Council Reg</span>
                <span className="font-mono text-foreground font-medium">
                  {profile?.council_reg_no || "MCI-2026-4491"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Experience</span>
                <span className="text-foreground font-medium">
                  {experienceYears} Years
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal & Practice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Full Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Mobile Number
                </label>
                <Input
                  value={profile?.mobile ? `+91 ${profile.mobile}` : "Not provided"}
                  disabled
                  className="text-xs bg-muted/40 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Healthcare Professional Registry (HPR)
                </label>
                <Input
                  value={profile?.hpr_id || "HPR-1234-5678"}
                  disabled
                  className="text-xs bg-muted/40 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  State Medical Council Reg. No.
                </label>
                <Input
                  value={profile?.council_reg_no || "MCI-2026-4491"}
                  disabled
                  className="text-xs bg-muted/40 font-mono"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Primary Clinic / Hospital
                </label>
                <Input
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Urdu">Urdu (اردو)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Profile Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
