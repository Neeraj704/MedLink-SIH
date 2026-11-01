import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, doctor_details(*)")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      full_name?: string;
      preferred_language?: string;
      dob?: string;
      gender?: string;
      blood_group?: string;
      avatar_path?: string;
      specializations?: string[];
      clinic_name?: string;
      address?: string;
      lat?: number;
      lng?: number;
      working_hours?: Record<string, unknown>;
      slot_minutes?: number;
      signature_path?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const profileFields: Record<string, unknown> = {};
      if (updates.full_name !== undefined) profileFields.full_name = updates.full_name;
      if (updates.preferred_language !== undefined) profileFields.preferred_language = updates.preferred_language;
      if (updates.dob !== undefined) profileFields.dob = updates.dob;
      if (updates.gender !== undefined) profileFields.gender = updates.gender;
      if (updates.blood_group !== undefined) profileFields.blood_group = updates.blood_group;
      if (updates.avatar_path !== undefined) profileFields.avatar_path = updates.avatar_path;

      if (Object.keys(profileFields).length > 0) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update(profileFields)
          .eq("id", user.id);
        if (pErr) throw pErr;
      }

      if (user.role === "doctor") {
        const doctorFields: Record<string, unknown> = {};
        if (updates.specializations !== undefined) doctorFields.specializations = updates.specializations;
        if (updates.clinic_name !== undefined) doctorFields.clinic_name = updates.clinic_name;
        if (updates.address !== undefined) doctorFields.address = updates.address;
        if (updates.lat !== undefined) doctorFields.lat = updates.lat;
        if (updates.lng !== undefined) doctorFields.lng = updates.lng;
        if (updates.working_hours !== undefined) doctorFields.working_hours = updates.working_hours;
        if (updates.slot_minutes !== undefined) doctorFields.slot_minutes = updates.slot_minutes;
        if (updates.signature_path !== undefined) doctorFields.signature_path = updates.signature_path;

        if (Object.keys(doctorFields).length > 0) {
          const { error: dErr } = await supabase
            .from("doctor_details")
            .update(doctorFields)
            .eq("user_id", user.id);
          if (dErr) throw dErr;
        }
      }

      await refreshProfile();
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: unknown) => {
      toast.error((err as Error)?.message || "Failed to update profile");
    },
  });
}
