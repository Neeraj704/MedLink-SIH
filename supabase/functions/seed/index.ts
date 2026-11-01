import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { getEnv } from "../_shared/supabase.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const seedToken = req.headers.get("x-seed-token");
  const expectedToken = getEnv("SEED_TOKEN", "medlink-secret-seed-token-2026");

  if (seedToken !== expectedToken) {
    return jsonError(req, 401, "unauthorized", "Invalid seed token");
  }

  return jsonResponse(req, {
    message: "Seed service active. Run 'npm run seed' for full database population.",
    status: "healthy",
  });
});
