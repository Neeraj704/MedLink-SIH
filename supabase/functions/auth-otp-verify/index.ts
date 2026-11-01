import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getEnv } from "../_shared/supabase.ts";
import { verifyOtpHash } from "../_shared/otp.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { challenge_id, otp } = await req.json();

    if (!challenge_id || !otp) {
      return jsonError(req, 400, "missing_fields", "Challenge ID and OTP are required");
    }

    const admin = createAdminClient();

    const { data: challenge, error: chErr } = await admin
      .from("otp_challenges")
      .select("*, profiles(*)")
      .eq("id", challenge_id)
      .maybeSingle();

    if (chErr || !challenge) {
      return jsonError(req, 404, "challenge_not_found", "Invalid challenge session");
    }

    if (challenge.consumed) {
      return jsonError(req, 410, "otp_consumed", "This verification code has already been used");
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      return jsonError(req, 410, "otp_expired", "This verification code has expired");
    }

    if (challenge.attempts >= 5) {
      return jsonError(
        req,
        429,
        "max_attempts_exceeded",
        "Too many failed attempts. Please request a new code."
      );
    }

    const pepper = getEnv("OTP_PEPPER", "medlink-default-pepper-2026");
    const isDemoMode = getEnv("DEMO_MODE", "true") === "true";
    const demoOtp = getEnv("DEMO_OTP", "587315");

    const isValid = await verifyOtpHash(
      otp.trim(),
      pepper,
      challenge.id,
      challenge.otp_hash,
      isDemoMode,
      demoOtp
    );

    const newAttempts = challenge.attempts + 1;

    if (!isValid) {
      await admin
        .from("otp_challenges")
        .update({ attempts: newAttempts })
        .eq("id", challenge.id);

      const attemptsLeft = Math.max(0, 5 - newAttempts);
      return jsonError(
        req,
        401,
        "otp_invalid",
        `Invalid code. ${attemptsLeft} attempts remaining.`,
        { attempts_left: attemptsLeft }
      );
    }

    // Success! Mark consumed
    await admin
      .from("otp_challenges")
      .update({ consumed: true, attempts: newAttempts })
      .eq("id", challenge.id);

    const profile = challenge.profiles;
    if (!profile) {
      return jsonError(req, 500, "profile_missing", "Associated profile missing");
    }

    // Generate Magic Link token
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email || `${profile.id}@users.medlink.app`,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("Generate link error:", linkErr);
      return jsonError(req, 500, "token_generation_failed", "Failed to generate authentication session");
    }

    // Audit log
    await admin.rpc("write_audit", {
      actor: profile.id,
      action: "login",
      entity: "profiles",
      entity_id: profile.id,
      meta: { purpose: challenge.purpose },
    });

    return jsonResponse(req, {
      token_hash: linkData.properties.hashed_token,
      role: profile.role,
      name: profile.full_name,
    });
  } catch (err: unknown) {
    console.error("OTP verify error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error during verification");
  }
});
