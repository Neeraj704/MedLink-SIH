import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LinkRecord {
  id: string;
  doctor_id: string;
  patient_id: string;
  status: "active" | "revoked";
  linked_at: string;
  revoked_at?: string;
  doctor?: {
    id: string;
    full_name: string;
    doctor_details?: {
      clinic_name?: string;
      specializations?: string[];
    };
  };
  patient?: {
    id: string;
    full_name: string;
    mobile?: string;
    abha_number?: string;
  };
}

export function useLinks() {
  const { user } = useAuth();

  return useQuery<LinkRecord[]>({
    queryKey: ["consent-links", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from("doctor_patient_links")
        .select(`
          *,
          doctor:profiles!doctor_patient_links_doctor_id_fkey(id, full_name, doctor_details(clinic_name, specializations)),
          patient:profiles!doctor_patient_links_patient_id_fkey(id, full_name, mobile, abha_number)
        `)
        .order("linked_at", { ascending: false });

      if (user!.role === "doctor") {
        query = query.eq("doctor_id", user!.id);
      } else {
        query = query.eq("patient_id", user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as LinkRecord[]) || [];
    },
  });
}

export const useConsentLinks = useLinks;

export function useRevokeLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const { data, error } = await supabase
        .from("doctor_patient_links")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
        })
        .eq("id", linkId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-links"] });
      queryClient.invalidateQueries({ queryKey: ["linked-patients"] });
      toast.success("Doctor's access revoked immediately");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to revoke consent");
    },
  });
}

export function useLinkPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      step: "request" | "confirm";
      identifier?: string;
      challenge_id?: string;
      otp?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("link-patient", {
        body: payload,
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Linking action failed");
      }

      return data;
    },
    onSuccess: (data, vars) => {
      if (vars.step === "confirm") {
        queryClient.invalidateQueries({ queryKey: ["consent-links"] });
        queryClient.invalidateQueries({ queryKey: ["linked-patients"] });
        queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
        toast.success("Patient successfully linked with verified consent!");
      }
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to link patient");
    },
  });
}
