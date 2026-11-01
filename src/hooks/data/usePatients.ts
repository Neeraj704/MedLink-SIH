import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LinkedPatient {
  id: string;
  link_id: string;
  status: string;
  linked_at: string;
  full_name: string;
  mobile?: string;
  abha_number?: string;
  abha_address?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  last_visit?: string;
  last_diagnosis?: string;
}

export function useLinkedPatients() {
  const { user } = useAuth();

  return useQuery<LinkedPatient[]>({
    queryKey: ["linked-patients", user?.id],
    enabled: !!user?.id && user?.role === "doctor",
    queryFn: async () => {
      const { data: links, error: linkErr } = await supabase
        .from("doctor_patient_links")
        .select(`
          id,
          status,
          linked_at,
          patient:profiles!doctor_patient_links_patient_id_fkey(
            id,
            full_name,
            mobile,
            abha_number,
            abha_address,
            dob,
            gender,
            blood_group
          )
        `)
        .eq("doctor_id", user!.id)
        .order("linked_at", { ascending: false });

      if (linkErr) throw linkErr;

      // Get latest consultations per patient
      const { data: consults } = await supabase
        .from("consultations")
        .select("patient_id, started_at, consultation_diagnoses(disease:disease_mappings(icd11_title))")
        .eq("doctor_id", user!.id)
        .order("started_at", { ascending: false });

      const lastVisitMap = new Map<string, { date: string; diag: string }>();
      if (consults) {
        for (const c of consults) {
          if (!lastVisitMap.has(c.patient_id)) {
            const row = c as unknown as {
              consultation_diagnoses?: Array<{
                disease?: { icd11_title?: string };
              }>;
            };
            const diagTitle =
              row.consultation_diagnoses?.[0]?.disease?.icd11_title ||
              "General Checkup";
            lastVisitMap.set(c.patient_id, {
              date: c.started_at,
              diag: diagTitle,
            });
          }
        }
      }

      interface LinkRow {
        id: string;
        status: string;
        linked_at: string;
        patient: {
          id: string;
          full_name: string;
          mobile?: string | null;
          abha_number?: string | null;
          abha_address?: string | null;
          dob?: string | null;
          gender?: string | null;
          blood_group?: string | null;
        };
      }

      return ((links || []) as unknown as LinkRow[]).map((l) => {
        const p = l.patient;
        const last = lastVisitMap.get(p.id);
        return {
          id: p.id,
          link_id: l.id,
          status: l.status,
          linked_at: l.linked_at,
          full_name: p.full_name,
          mobile: p.mobile,
          abha_number: p.abha_number,
          abha_address: p.abha_address,
          dob: p.dob,
          gender: p.gender,
          blood_group: p.blood_group,
          last_visit: last?.date || l.linked_at,
          last_diagnosis: last?.diag || "No consultations yet",
        };
      });
    },
  });
}

export function usePatient(patientId?: string) {
  return useQuery({
    queryKey: ["patient-detail", patientId],
    enabled: !!patientId,
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          *,
          patient_identifiers(*),
          consultations:consultations!consultations_patient_id_fkey(
            id,
            status,
            started_at,
            published_at,
            vitals,
            chief_complaint,
            consultation_diagnoses(*, disease:disease_mappings(*)),
            medications(*)
          ),
          documents:documents!documents_patient_id_fkey(*)
        `)
        .eq("id", patientId!)
        .single();

      if (error) throw error;
      return profile;
    },
  });
}

export function useCreateWalkinPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      mobile?: string;
      abha?: string;
      dob?: string;
      gender?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-patient", {
        body: payload,
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Failed to create patient");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["linked-patients"] });
      toast.success(`Walk-in patient "${data?.profile?.full_name}" registered and linked`);
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to register patient");
    },
  });
}
