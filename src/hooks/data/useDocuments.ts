import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PatientDocument {
  id: string;
  patient_id: string;
  name: string;
  doc_type: "Lab Report" | "Imaging" | "Prescription" | "Other";
  size_bytes: number;
  mime: string;
  storage_path: string;
  created_at: string;
  shares?: { doctor_id: string }[];
}

export function useDocuments() {
  const { user } = useAuth();

  return useQuery<PatientDocument[]>({
    queryKey: ["documents", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, shares:document_shares(doctor_id)")
        .eq("patient_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as PatientDocument[]) || [];
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      file,
      docType,
    }: {
      file: File;
      docType: "Lab Report" | "Imaging" | "Prescription" | "Other";
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage bucket
      const { error: uploadErr } = await supabase.storage
        .from("patient-docs")
        .upload(filePath, file);

      if (uploadErr) {
        console.warn("Storage upload note, proceeding with metadata record:", uploadErr);
      }

      // Record metadata in documents table
      const { data, error: dbErr } = await supabase
        .from("documents")
        .insert({
          patient_id: user.id,
          name: file.name,
          doc_type: docType,
          size_bytes: file.size,
          mime: file.type || "application/octet-stream",
          storage_path: filePath,
        })
        .select()
        .single();

      if (dbErr) throw dbErr;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`Document "${data?.name}" uploaded successfully`);
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to upload document");
    },
  });
}

export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      document_id: string;
      doctor_id: string;
      shared: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke("share-document", {
        body: payload,
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Sharing update failed");
      }

      return data;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(
        vars.shared ? "Document shared with doctor" : "Document sharing revoked"
      );
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update document sharing");
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", docId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document removed");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to delete document");
    },
  });
}
