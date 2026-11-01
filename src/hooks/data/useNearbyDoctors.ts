import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NearbyDoctor {
  user_id: string;
  full_name: string;
  specializations: string[];
  clinic_name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  distance_km: number;
  next_slot: string;
}

export function useNearbyDoctors(
  lat: number = 26.9124,
  lng: number = 75.7873,
  radiusKm: number = 50,
  specialization?: string
) {
  return useQuery<NearbyDoctor[]>({
    queryKey: ["nearby-doctors", lat, lng, radiusKm, specialization],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("nearby_doctors", {
        user_lat: lat,
        user_lng: lng,
        radius_km: radiusKm,
        spec: specialization && specialization !== "All" ? specialization : null,
      });

      if (error) {
        console.error("Nearby doctors error:", error);
        return [];
      }

      return (data as unknown as NearbyDoctor[]) || [];
    },
    staleTime: 60000,
  });
}
