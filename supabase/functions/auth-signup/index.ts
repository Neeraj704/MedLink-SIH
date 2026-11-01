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
    const body = await req.json();
    const { role, name, mobile, identifier, language = "English", consent } = body;

    if (!consent) {
      return jsonError(req, 400, "consent_required", "Consent is required to create an account");
    }

    if (!role || (role !== "doctor" && role !== "patient")) {
      return jsonError(req, 400, "invalid_role", "Valid role ('doctor' or 'patient') is required");
    }

    const cleanName = (name || "").trim();
    if (cleanName.length < 2) {
      return jsonError(req, 400, "invalid_name", "Name must be at least 2 characters");
    }

    const cleanMobile = (mobile || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return jsonError(req, 400, "invalid_mobile", "Valid 10-digit Indian mobile number is required");
    }

    const admin = createAdminClient();

    // Check doctor requirements
    let hprId: string | null = null;
    let councilRegNo: string | null = null;
    let abhaNumber: string | null = null;
    let abhaAddress: string | null = null;

    if (role === "doctor") {
      if (!identifier || !identifier.trim()) {
        return jsonError(req, 400, "identifier_required", "Doctor registration requires an HPR ID or Council Registration Number");
      }
      const detected = resolveIdentifier("doctor", identifier);
      if (detected.kind === "hpr") {
        hprId = detected.value;
      } else if (detected.kind === "council") {
        councilRegNo = detected.value;
      } else {
        return jsonError(req, 400, "invalid_doctor_id", "Please provide a valid HPR ID (e.g. HPR-1234-5678) or Council Reg No.");
      }
    } else {
      // Patient identifier is optional
      if (identifier && identifier.trim()) {
        const detected = resolveIdentifier("patient", identifier);
        if (detected.kind === "abha") {
          abhaNumber = detected.value;
        } else if (detected.kind === "abha_address") {
          abhaAddress = detected.value;
        }
      }
    }

    // Check existing profile
    const { data: existingProfiles, error: searchErr } = await admin
      .from("profiles")
      .select("id, claimed, mobile, abha_number, hpr_id")
      .or(`mobile.eq.${cleanMobile}${abhaNumber ? `,abha_number.eq.${abhaNumber}` : ""}${hprId ? `,hpr_id.eq.${hprId}` : ""}`);

    if (searchErr) {
      console.error("Profile check error:", searchErr);
    }

    let profileId: string | null = null;

    if (existingProfiles && existingProfiles.length > 0) {
      const existing = existingProfiles[0];
      if (existing.claimed) {
        return jsonError(req, 409, "account_exists", "An account with these details already exists. Please sign in instead.");
      }
      // Unclaimed walk-in profile: claim it!
      profileId = existing.id;
      await admin
        .from("profiles")
        .update({
          full_name: cleanName,
          claimed: true,
          preferred_language: language,
          ...(abhaNumber ? { abha_number: abhaNumber } : {}),
          ...(abhaAddress ? { abha_address: abhaAddress } : {}),
        })
        .eq("id", profileId);
    } else {
      // Create auth user
      const userUuid = crypto.randomUUID();
      const syntheticEmail = `${userUuid}@users.medlink.app`;

      const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
        id: userUuid,
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { role, full_name: cleanName, mobile: cleanMobile },
      });

      if (authErr || !authUser?.user) {
        console.error("Create user error:", authErr);
        return jsonError(req, 500, "user_creation_failed", "Failed to create user account");
      }

      profileId = authUser.user.id;

      // Insert profile
      const { error: profInsertErr } = await admin.from("profiles").insert({
        id: profileId,
        role,
        full_name: cleanName,
        mobile: cleanMobile,
        email: syntheticEmail,
        preferred_language: language,
        abha_number: abhaNumber,
        abha_address: abhaAddress,
        hpr_id: hprId,
        council_reg_no: councilRegNo,
        claimed: true,
      });

      if (profInsertErr) {
        console.error("Profile insert error:", profInsertErr);
        return jsonError(req, 500, "profile_failed", "Failed to create profile");
      }

      if (role === "doctor") {
        await admin.from("doctor_details").insert({
          user_id: profileId,
          clinic_name: "Consultation Clinic",
          address: "Jaipur, Rajasthan",
          specializations: ["General Medicine"],
          experience_years: 5,
        });
      } else {
        if (abhaNumber) {
          await admin.from("patient_identifiers").insert({
            patient_id: profileId,
            type: "abha",
            value: abhaNumber,
          });
        }
        await admin.from("patient_identifiers").insert({
          patient_id: profileId,
          type: "phone",
          value: cleanMobile,
        });
      }
    }

    // Issue OTP Challenge
    const isDemoMode = getEnv("DEMO_MODE", "true") === "true";
    const demoOtp = getEnv("DEMO_OTP", "587315");
    const pepper = getEnv("OTP_PEPPER", "medlink-default-pepper-2026");
    const generatedCode = isDemoMode ? demoOtp : generateOtp();

    const challengeId = crypto.randomUUID();
    const otpHash = await hashOtp(generatedCode, pepper, challengeId);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await admin.from("otp_challenges").insert({
      id: challengeId,
      profile_id: profileId,
      purpose: "signup",
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      consumed: false,
    });

    console.log(`[AUTH-SIGNUP] OTP for ${cleanMobile} (challenge ${challengeId}): ${generatedCode}`);

    return jsonResponse(req, {
      challenge_id: challengeId,
      masked_target: maskTarget(cleanMobile),
      resend_after: 30,
    });
  } catch (err: unknown) {
    console.error("Signup error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error during signup");
  }
});
