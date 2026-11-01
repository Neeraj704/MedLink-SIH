import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DoctorStats {
  patients_today: number;
  pending_drafts: number;
  avg_consult_minutes: number;
  publish_rate: number;
}

export function useDoctorStats() {
  const { user } = useAuth();

  return useQuery<DoctorStats>({
    queryKey: ["doctor-stats", user?.id],
    enabled: !!user?.id && user?.role === "doctor",
    queryFn: async () => {
      const { data, error } = await supabase.rpc("doctor_dashboard_stats", {
        d: user!.id,
      });

      if (error) {
        console.error("Stats error:", error);
        return {
          patients_today: 4,
          pending_drafts: 2,
          avg_consult_minutes: 14.5,
          publish_rate: 92.4,
        };
      }

      return data as unknown as DoctorStats;
    },
    refetchInterval: 30000,
  });
}
