import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

export function getEnv(key: string, fallback = ""): string {
  return Deno.env.get(key) || fallback;
}

export function createAdminClient() {
  const url = getEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  const serviceKey = getEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
  );
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createUserClient(req: Request) {
  const url = getEnv("SUPABASE_URL", "http://127.0.0.1:54321");
  const anonKey = getEnv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  );
  const authHeader = req.headers.get("Authorization") || "";

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getUserAndProfile(req: Request) {
  const userClient = createUserClient(req);
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();

  if (userErr || !user) {
    return { user: null, profile: null, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profErr } = await adminClient
    .from("profiles")
    .select("*, doctor_details(*)")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr || !profile) {
    return { user, profile: null, error: "Profile not found" };
  }

  return { user, profile, error: null };
}
