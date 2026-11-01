import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getEnv } from "../_shared/supabase.ts";
import { generateOtp, hashOtp, maskTarget } from "../_shared/otp.ts";
import { resolveIdentifier } from "../_shared/identifier.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { role, identifier } = await req.json();

    if (!role || (role !== "doctor" && role !== "patient")) {
      return jsonError(req, 400, "invalid_role", "Valid role is required");
    }

    if (!identifier || !identifier.trim()) {
      return jsonError(req, 400, "identifier_required", "Identifier is required");
    }

    const admin = createAdminClient();
    const detected = resolveIdentifier(role, identifier);

    // Build lookup query
    let query = admin.from("profiles").select("id, role, mobile, full_name, claimed").eq("role", role);

    if (detected.kind === "mobile") {
      query = query.eq("mobile", detected.value);
    } else if (detected.kind === "abha") {
      query = query.eq("abha_number", detected.value);
    } else if (detected.kind === "abha_address") {
      query = query.eq("abha_address", detected.value);
    } else if (detected.kind === "hpr") {
      query = query.eq("hpr_id", detected.value);
    } else if (detected.kind === "council") {
      query = query.eq("council_reg_no", detected.value);
    } else {
      // Fallback search across fields
      const cleanDigits = identifier.replace(/\D/g, "");
      if (cleanDigits.length === 10) {
        query = query.eq("mobile", cleanDigits);
      } else if (cleanDigits.length === 14) {
        query = query.eq("abha_number", cleanDigits);
      } else {
        query = query.or(`hpr_id.eq.${identifier},council_reg_no.eq.${identifier},abha_address.eq.${identifier}`);
      }
    }

    const { data: profiles, error: findErr } = await query;

    if (findErr || !profiles || profiles.length === 0) {
      return jsonError(
        req,
        404,
        "profile_not_found",
        `No ${role} account found for this ID. Would you like to create an account?`
      );
    }

    const profile = profiles[0];

    // Rate limiting: 3 per minute, 10 per hour
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count: minCount } = await admin
      .from("otp_challenges")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .gte("created_at", oneMinAgo);

    if (minCount !== null && minCount >= 3) {
      return jsonError(
        req,
        429,
        "rate_limited",
        "Too many OTP requests. Please wait a minute before trying again."
      );
    }

    const { count: hourCount } = await admin
      .from("otp_challenges")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .gte("created_at", oneHourAgo);

    if (hourCount !== null && hourCount >= 10) {
      return jsonError(
        req,
        429,
        "rate_limited",
        "Hourly limit reached for OTP requests. Please try again later."
      );
    }

    // Generate and hash OTP
    const isDemoMode = getEnv("DEMO_MODE", "true") === "true";
    const demoOtp = getEnv("DEMO_OTP", "587315");
    const pepper = getEnv("OTP_PEPPER", "medlink-default-pepper-2026");
    const generatedCode = isDemoMode ? demoOtp : generateOtp();

    const challengeId = crypto.randomUUID();
    const otpHash = await hashOtp(generatedCode, pepper, challengeId);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insErr } = await admin.from("otp_challenges").insert({
      id: challengeId,
      profile_id: profile.id,
      purpose: "login",
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      consumed: false,
    });

    if (insErr) {
      console.error("OTP challenge creation error:", insErr);
      return jsonError(req, 500, "challenge_failed", "Failed to initiate login challenge");
    }

    const maskedTarget = maskTarget(profile.mobile || identifier);
    console.log(`[AUTH-OTP-REQUEST] OTP for ${profile.full_name} (${maskedTarget}): ${generatedCode}`);

    return jsonResponse(req, {
      challenge_id: challengeId,
      masked_target: maskedTarget,
      resend_after: 30,
    });
  } catch (err: unknown) {
    console.error("OTP request error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
