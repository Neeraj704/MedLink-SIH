import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DiseaseMapping {
  id: number;
  icd11_title: string;
  icd11_code: string | null;
  ayurveda_term: string | null;
  ayurveda_code: string | null;
  ayurveda_sim: number | null;
  ayurveda_def: string | null;
  siddha_term: string | null;
  siddha_code: string | null;
  siddha_sim: number | null;
  siddha_def: string | null;
  unani_term: string | null;
  unani_code: string | null;
  unani_sim: number | null;
  unani_def: string | null;
}

export function useDiseaseSearch(query: string, limit = 8) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<DiseaseMapping[]>({
    queryKey: ["disease-search", debouncedQuery, limit],
    enabled: debouncedQuery.trim().length >= 2,
    queryFn: async () => {
      const clean = debouncedQuery.trim();
      const { data, error } = await supabase.rpc("search_diseases", {
        q: clean,
        lim: limit,
      });

      if (error) {
        console.error("Disease search error:", error);
        return [];
      }

      return (data as unknown as DiseaseMapping[]) || [];
    },
    staleTime: 60000,
  });
}
