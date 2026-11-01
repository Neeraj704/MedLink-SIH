import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLogRow {
  id: number;
  actor_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  meta: Record<string, unknown> | null;
  prev_hash: string;
  hash: string;
  created_at: string;
}

export function useAuditLog() {
  const { user } = useAuth();

  return useQuery<AuditLogRow[]>({
    queryKey: ["audit-log", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("actor_id", user!.id)
        .order("id", { ascending: false });

      if (error) throw error;
      return (data as unknown as AuditLogRow[]) || [];
    },
  });
}

// Client-side verifier for the cryptographic hash chain
export async function verifyAuditChain(logs: AuditLogRow[]): Promise<boolean> {
  if (logs.length <= 1) return true;

  // Sort ascending by ID to verify chain forward
  const sorted = [...logs].sort((a, b) => a.id - b.id);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (curr.prev_hash !== prev.hash) {
      return false;
    }
  }

  return true;
}
