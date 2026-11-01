import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface StoredFhirBundle {
  id: string;
  consultation_id: string;
  bundle: Record<string, unknown>;
  version: number;
  published: boolean;
  validation: { ok: boolean; errors: string[] };
  created_at: string;
  consultation?: {
    started_at: string;
    chief_complaint?: string;
    patient?: {
      full_name: string;
      abha_number?: string;
    };
  };
}

export function useFhirBundles() {
  const { user } = useAuth();

  return useQuery<StoredFhirBundle[]>({
    queryKey: ["fhir-bundles", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from("fhir_bundles")
        .select(`
          *,
          consultation:consultations(
            started_at,
            chief_complaint,
            doctor_id,
            patient_id,
            patient:profiles!consultations_patient_id_fkey(full_name, abha_number)
          )
        `)
        .order("created_at", { ascending: false });

      if (user!.role === "doctor") {
        query = query.eq("consultation.doctor_id", user!.id);
      } else {
        query = query.eq("consultation.patient_id", user!.id).eq("published", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as StoredFhirBundle[]) || [];
    },
  });
}

export function useTogglePublishBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("fhir_bundles")
        .update({ published })
        .eq("id", id);

      if (error) throw error;
      return published;
    },
    onSuccess: (published) => {
      queryClient.invalidateQueries({ queryKey: ["fhir-bundles"] });
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast.success(published ? "FHIR record published" : "FHIR record unpublished");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update bundle status");
    },
  });
}
