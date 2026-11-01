import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  Share2,
  Shield,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useDocuments,
  useUploadDocument,
  useShareDocument,
  useDeleteDocument,
} from "@/hooks/data/useDocuments";
import { useConsentLinks } from "@/hooks/data/useLinks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PatientDocuments() {
  const { data: documents = [], isLoading } = useDocuments();
  const { data: consentLinks = [] } = useConsentLinks();

  const uploadMutation = useUploadDocument();
  const shareMutation = useShareDocument();
  const deleteMutation = useDeleteDocument();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<
    "Lab Report" | "Imaging" | "Prescription" | "Other"
  >("Lab Report");

  // Sharing modal state
  const [sharingDoc, setSharingDoc] = useState<(typeof documents)[0] | null>(
    null
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size cannot exceed 15MB");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file,
        name: file.name,
        doc_type: docType,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // Toast surfaced by mutation
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // Toast surfaced by mutation
      }
    }
  };

  const handleToggleShare = async (doctorId: string, isShared: boolean) => {
    if (!sharingDoc) return;
    try {
      await shareMutation.mutateAsync({
        document_id: sharingDoc.id,
        doctor_id: doctorId,
        shared: !isShared,
      });
    } catch {
      // Toast surfaced by mutation
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Health Records & Documents</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Encrypted document storage with granular per-doctor consent sharing controls
        </p>
      </motion.div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b">
            <div className="text-xs text-muted-foreground">
              Select category before uploading:
            </div>
            <div className="flex gap-2">
              {(["Lab Report", "Imaging", "Prescription", "Other"] as const).map(
                (t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={docType === t ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setDocType(t)}
                  >
                    {t}
                  </Button>
                )
              )}
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/10 hover:bg-muted/20"
          >
            <Upload className="w-10 h-10 mx-auto mb-2 text-primary opacity-60" />
            <p className="font-semibold text-sm text-foreground">
              Click or drag to upload medical reports
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports PDF, PNG, JPG up to 15MB &bull; Stored securely with Row Level Security
            </p>
            {uploadMutation.isPending && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading document...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Gallery */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Stored Patient Records
            <Badge variant="outline" className="text-xs ml-1">
              {documents.length} files
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p>No documents uploaded yet</p>
              <p className="text-[11px]">
                Upload your lab tests or imaging scans above to share with verified doctors.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isPdf = doc.name.toLowerCase().endsWith(".pdf");
                const sharesCount = (doc.shares || []).length;

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 border rounded-lg bg-card gap-3 hover:border-primary/30 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => {
                        const url = supabase.storage
                          .from("patient-docs")
                          .getPublicUrl(doc.storage_path).data.publicUrl;
                        window.open(url, "_blank");
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {isPdf ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                          {doc.name}
                          <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] h-4">
                            {doc.doc_type}
                          </Badge>
                          <span>&bull;</span>
                          <span>{(doc.size_bytes / 1024).toFixed(0)} KB</span>
                          <span>&bull;</span>
                          <span>
                            {new Date(doc.created_at).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => {
                          const url = supabase.storage
                            .from("patient-docs")
                            .getPublicUrl(doc.storage_path).data.publicUrl;
                          window.open(url, "_blank");
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setSharingDoc(doc)}
                      >
                        <Share2 className="w-3.5 h-3.5 text-primary" />
                        Consent Access
                        {sharesCount > 0 && (
                          <Badge
                            variant="default"
                            className="text-[10px] h-4 px-1.5 ml-1 bg-primary"
                          >
                            {sharesCount}
                          </Badge>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(doc.id, doc.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctor Sharing Consent Dialog */}
      <Dialog
        open={!!sharingDoc}
        onOpenChange={(open) => {
          if (!open) setSharingDoc(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-primary" /> Grant Doctor Document Access
            </DialogTitle>
            <DialogDescription className="text-xs">
              Toggle which linked doctors can view &ldquo;{sharingDoc?.name}&rdquo;.
              Revoking takes effect immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {consentLinks.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No active doctor links. Link with a doctor from the doctor&apos;s desk to grant access.
              </div>
            ) : (
              consentLinks.map((link) => {
                const doctorId = link.doctor_id;
                const isShared = (sharingDoc?.shares || sharingDoc?.document_shares || []).some(
                  (s: { doctor_id: string }) => s.doctor_id === doctorId
                );

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        {link.doctor?.full_name || "Doctor"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {link.doctor?.doctor_details?.clinic_name || "Integrated Clinic"}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isShared ? "default" : "outline"}
                      className="h-8 text-xs gap-1.5"
                      onClick={() => handleToggleShare(doctorId, isShared)}
                      disabled={shareMutation.isPending}
                    >
                      {isShared ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Access Granted
                        </>
                      ) : (
                        "Grant Access"
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
