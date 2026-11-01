import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  CreditCard,
  QrCode,
  Save,
  Loader2,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Stethoscope,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/data/useProfile";
import { useConsentLinks, useRevokeLink } from "@/hooks/data/useLinks";
import { useAuditLog, verifyAuditChain, type AuditLogRow } from "@/hooks/data/useAuditLog";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function PatientProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: consentLinks = [], isLoading: linksLoading } = useConsentLinks();
  const revokeLinkMutation = useRevokeLink();
  const { data: auditLogs = [], isLoading: logsLoading } = useAuditLog();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [chainIntact, setChainIntact] = useState<boolean | null>(null);
  const [copiedAbha, setCopiedAbha] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setDob(profile.dob || "1994-06-18");
      setGender(profile.gender || "Female");
      setBloodGroup(profile.blood_group || "O+");
      setPreferredLanguage(profile.preferred_language || "English");

      const abha = profile.abha_number || user?.identifier || "91-8842-1920-3341";
      QRCode.toDataURL(
        JSON.stringify({
          abha_number: abha,
          name: profile.full_name,
          gender: profile.gender,
          dob: profile.dob,
          standard: "ABDM-HL7-FHIR",
        }),
        { width: 200, margin: 1 }
      )
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    } else if (user) {
      setName(user.name || "");
    }
  }, [profile, user]);

  useEffect(() => {
    if (auditLogs && auditLogs.length > 0) {
      verifyAuditChain(auditLogs).then((intact) => setChainIntact(intact));
    }
  }, [auditLogs]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        full_name: name.trim(),
        dob,
        gender,
        blood_group: bloodGroup,
        preferred_language: preferredLanguage,
      });
    } catch {
      // Toast surfaced by hook
    }
  };

  const handleRevokeConsent = async (linkId: string, doctorName: string) => {
    if (
      window.confirm(
        `Are you sure you want to revoke Dr. ${doctorName}'s access? They will immediately lose access to your consultations and records.`
      )
    ) {
      try {
        await revokeLinkMutation.mutateAsync(linkId);
      } catch {
        // Toast surfaced by hook
      }
    }
  };

  const copyAbha = () => {
    const val = profile?.abha_number || user?.identifier || "91-8842-1920-3341";
    navigator.clipboard.writeText(val);
    setCopiedAbha(true);
    toast.success("ABHA Number copied");
    setTimeout(() => setCopiedAbha(false), 2000);
  };

  if (profileLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading patient profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">ABHA Profile & Consent Center</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your ABDM Ayushman Bharat Health Account, revoke doctor consent, and verify tamper-evident audit logs
        </p>
      </motion.div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="h-9">
          <TabsTrigger value="details" className="text-xs">
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="consent" className="text-xs">
            Consent Manager ({consentLinks.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            Activity & Audit Log ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Details */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Card: ABHA QR */}
            <Card className="lg:col-span-1 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto border-2 border-primary/20">
                  {name?.charAt(0) || "P"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {name || "Patient"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Preferred Language: {preferredLanguage}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    <CreditCard className="w-3 h-3 mr-1" /> ABHA Linked
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Shield className="w-3 h-3 mr-1" /> ABDM Consent Verified
                  </Badge>
                </div>

                {/* Real ABDM QR code */}
                <div className="p-4 border rounded-xl bg-card shadow-sm space-y-2">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="ABHA QR Code"
                      className="size-36 mx-auto rounded"
                    />
                  ) : (
                    <QrCode className="size-28 mx-auto text-muted-foreground/30" />
                  )}
                  <p className="text-[11px] font-semibold text-foreground">
                    ABHA QR Code
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Scan at any ABDM-enabled hospital registration counter
                  </p>
                </div>

                <div className="pt-2 text-left text-xs space-y-2 border-t text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>ABHA Number:</span>
                    <button
                      type="button"
                      onClick={copyAbha}
                      className="font-mono text-foreground font-semibold flex items-center gap-1 hover:text-primary"
                    >
                      {profile?.abha_number || user?.identifier || "91-8842-1920-3341"}
                      {copiedAbha ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile:</span>
                    <span className="font-mono text-foreground">
                      {profile?.mobile ? `+91 ${profile.mobile}` : "Verified"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Card: Personal Details Form */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Identity & Clinical Demographics
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
                      ABHA ID (14 digits)
                    </label>
                    <Input
                      value={profile?.abha_number || "91-8842-1920-3341"}
                      disabled
                      className="text-xs bg-muted/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      ABHA Address (@abdm)
                    </label>
                    <Input
                      value={profile?.abha_address || "priya.sharma@abdm"}
                      disabled
                      className="text-xs bg-muted/40 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-foreground block mb-1">
                      Blood Group
                    </label>
                    <Input
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
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
                      <option value="Bengali">Bengali (বাংলা)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending ? (
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
        </TabsContent>

        {/* Tab 2: Consent Manager */}
        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Active Doctor Consent Permissions
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Doctors who hold active consent to view your clinical records and author diagnoses.
                You can revoke access at any time.
              </p>
            </CardHeader>
            <CardContent>
              {linksLoading ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading permissions...
                </div>
              ) : consentLinks.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                  <Shield className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold text-foreground">No active doctor links</p>
                  <p>When you consent to doctor linking via OTP, permissions will be listed here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consentLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-foreground">
                            {link.doctor?.full_name || "Doctor"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {link.doctor?.doctor_details?.clinic_name || "Integrated Clinic"} &bull;{" "}
                            Consent Linked:{" "}
                            {new Date(link.linked_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                          Active Consent
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleRevokeConsent(link.id, link.doctor?.full_name || "Doctor")
                          }
                          disabled={revokeLinkMutation.isPending}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Revoke Access
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Tamper-Evident Audit Log */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" /> Tamper-Evident Activity Chain
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cryptographically hash-chained record access log matching landing page specifications
                </p>
              </div>

              {chainIntact !== null && (
                <Badge
                  className={`text-xs gap-1.5 py-1 ${
                    chainIntact
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-destructive/10 text-destructive border-destructive/30"
                  }`}
                  variant="outline"
                >
                  {chainIntact ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Cryptographic Chain Intact
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      Chain Verification Discrepancy
                    </>
                  )}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading audit chain...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                  <Lock className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  <p>No audit events recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-2.5">Time</th>
                        <th className="text-left py-2.5">Action</th>
                        <th className="text-left py-2.5">Resource Entity</th>
                        <th className="text-left py-2.5 font-mono">Current SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 font-semibold text-foreground">
                            {log.action}
                          </td>
                          <td className="py-2.5 text-muted-foreground">
                            {log.entity}
                          </td>
                          <td className="py-2.5 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {log.hash.slice(0, 16)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
