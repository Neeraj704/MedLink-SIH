import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ConsultationFilters {
  patient_id?: string;
  status?: "draft" | "published" | "all";
}

export function useConsultations(filters: ConsultationFilters = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["consultations", user?.id, user?.role, filters],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from("consultations")
        .select(`
          *,
          patient:profiles!consultations_patient_id_fkey(id, full_name, mobile, abha_number),
          doctor:profiles!consultations_doctor_id_fkey(id, full_name, doctor_details(clinic_name, address)),
          diagnoses:consultation_diagnoses(*, disease:disease_mappings(*)),
          medications(*),
          bundle:fhir_bundles(id, bundle, validation, published)
        `)
        .order("started_at", { ascending: false });

      if (user!.role === "doctor") {
        query = query.eq("doctor_id", user!.id);
      } else {
        query = query.eq("patient_id", user!.id).eq("status", "published");
      }

      if (filters.patient_id) {
        query = query.eq("patient_id", filters.patient_id);
      }

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useConsultation(consultationId?: string) {
  return useQuery({
    queryKey: ["consultation", consultationId],
    enabled: !!consultationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:profiles!consultations_patient_id_fkey(*),
          doctor:profiles!consultations_doctor_id_fkey(*, doctor_details(*)),
          diagnoses:consultation_diagnoses(*, disease:disease_mappings(*)),
          medications(*),
          bundle:fhir_bundles(*)
        `)
        .eq("id", consultationId!)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useSaveConsultationDraft() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      patient_id: string;
      appointment_id?: string;
      vitals?: Record<string, unknown>;
      chief_complaint?: string;
      history?: string;
      duration_seconds?: number;
      diagnoses?: { disease_id: number; confirmed_by_doctor: boolean; note?: string }[];
      medications?: { drug: string; dosage: string; frequency: string; duration_days: number; instructions?: string; sort?: number }[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      let consultId = payload.id;

      if (!consultId) {
        // Create new draft
        const { data: newConsult, error: cErr } = await supabase
          .from("consultations")
          .insert({
            doctor_id: user.id,
            patient_id: payload.patient_id,
            appointment_id: payload.appointment_id || null,
            status: "draft",
            vitals: payload.vitals || {},
            chief_complaint: payload.chief_complaint || "",
            history: payload.history || "",
            duration_seconds: payload.duration_seconds || 0,
          })
          .select("id")
          .single();

        if (cErr) throw cErr;
        consultId = newConsult.id;
      } else {
        // Update draft
        const { error: uErr } = await supabase
          .from("consultations")
          .update({
            vitals: payload.vitals || {},
            chief_complaint: payload.chief_complaint || "",
            history: payload.history || "",
            duration_seconds: payload.duration_seconds || 0,
          })
          .eq("id", consultId);

        if (uErr) throw uErr;
      }

      // Sync diagnoses if provided
      if (payload.diagnoses) {
        await supabase
          .from("consultation_diagnoses")
          .delete()
          .eq("consultation_id", consultId);

        if (payload.diagnoses.length > 0) {
          await supabase.from("consultation_diagnoses").insert(
            payload.diagnoses.map((d) => ({
              consultation_id: consultId!,
              disease_id: d.disease_id,
              confirmed_by_doctor: d.confirmed_by_doctor,
              note: d.note || null,
            }))
          );
        }
      }

      // Sync medications if provided
      if (payload.medications) {
        await supabase
          .from("medications")
          .delete()
          .eq("consultation_id", consultId);

        if (payload.medications.length > 0) {
          await supabase.from("medications").insert(
            payload.medications.map((m, idx) => ({
              consultation_id: consultId!,
              drug: m.drug,
              dosage: m.dosage,
              frequency: m.frequency,
              duration_days: m.duration_days,
              instructions: m.instructions || null,
              sort: m.sort ?? idx,
            }))
          );
        }
      }

      return consultId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
      return id;
    },
  });
}

export function usePublishConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const { data, error } = await supabase.functions.invoke("publish-consultation", {
        body: { consultation_id: consultationId },
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Failed to publish consultation");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["fhir-bundles"] });
      toast.success("Consultation published & FHIR R4 Bundle created!");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to publish consultation");
    },
  });
}
