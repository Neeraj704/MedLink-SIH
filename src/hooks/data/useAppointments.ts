import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  starts_at: string;
  duration_min: number;
  type: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  notes?: string;
  decided_at?: string;
  created_at: string;
  patient?: {
    id: string;
    full_name: string;
    mobile?: string;
    abha_number?: string;
  };
  doctor?: {
    id: string;
    full_name: string;
    doctor_details?: {
      clinic_name?: string;
      address?: string;
    };
  };
}

export function useAppointments(role: "doctor" | "patient") {
  const { user } = useAuth();

  return useQuery<Appointment[]>({
    queryKey: ["appointments", user?.id, role],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, mobile, abha_number),
          doctor:profiles!appointments_doctor_id_fkey(id, full_name, doctor_details(clinic_name, address))
        `)
        .order("starts_at", { ascending: true });

      if (role === "doctor") {
        query = query.eq("doctor_id", user!.id);
      } else {
        query = query.eq("patient_id", user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as Appointment[]) || [];
    },
    refetchInterval: 15000,
  });
}

export function useSlots(doctorId?: string, date?: string) {
  return useQuery({
    queryKey: ["doctor-slots", doctorId, date],
    enabled: !!doctorId && !!date,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("book-appointment", {
        body: {
          action: "list-slots",
          doctor_id: doctorId,
          date,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Failed to load slots");
      }

      return data?.slots || [];
    },
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      doctor_id: string;
      starts_at: string;
      type: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("book-appointment", {
        body: payload,
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Booking failed");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-slots"] });
      toast.success("Appointment request sent to doctor!");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to book appointment");
    },
  });
}

export function useRespondAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      appointment_id: string;
      decision: "approved" | "rejected";
    }) => {
      const { data, error } = await supabase.functions.invoke("respond-appointment", {
        body: payload,
      });

      if (error || data?.error) {
        throw new Error(data?.error?.message || error?.message || "Action failed");
      }

      return data;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["linked-patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
      toast.success(`Appointment ${vars.decision}`);
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to respond to appointment");
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to cancel appointment");
    },
  });
}
