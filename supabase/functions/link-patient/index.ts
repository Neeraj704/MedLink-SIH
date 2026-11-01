import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getUserAndProfile, getEnv } from "../_shared/supabase.ts";
import { generateOtp, hashOtp, maskTarget, verifyOtpHash } from "../_shared/otp.ts";
import { resolveIdentifier } from "../_shared/identifier.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { profile: doctorProfile, error: authErr } = await getUserAndProfile(req);
    if (authErr || !doctorProfile || doctorProfile.role !== "doctor") {
      return jsonError(req, 403, "forbidden", "Only doctors can link patients");
    }

    const body = await req.json();
    const { step = "request" } = body;
    const admin = createAdminClient();

    if (step === "request") {
      const { identifier } = body;
      if (!identifier || !identifier.trim()) {
        return jsonError(req, 400, "identifier_required", "Patient identifier required");
      }

      const detected = resolveIdentifier("patient", identifier);
      let query = admin.from("profiles").select("id, full_name, mobile, abha_number, abha_address").eq("role", "patient");

      if (detected.kind === "mobile") {
        query = query.eq("mobile", detected.value);
      } else if (detected.kind === "abha") {
        query = query.eq("abha_number", detected.value);
      } else if (detected.kind === "abha_address") {
        query = query.eq("abha_address", detected.value);
      } else {
        const digits = identifier.replace(/\D/g, "");
        if (digits.length === 10) {
          query = query.eq("mobile", digits);
        } else if (digits.length === 14) {
          query = query.eq("abha_number", digits);
        } else {
          query = query.or(`abha_address.eq.${identifier},mobile.eq.${identifier}`);
        }
      }

      const { data: patients, error: patErr } = await query;
      if (patErr || !patients || patients.length === 0) {
        return jsonError(req, 404, "patient_not_found", "No patient found with the provided identifier");
      }

      const patient = patients[0];

      // Check if already linked
      const { data: existingLink } = await admin
        .from("doctor_patient_links")
        .select("id, status")
        .eq("doctor_id", doctorProfile.id)
        .eq("patient_id", patient.id)
        .maybeSingle();

      if (existingLink && existingLink.status === "active") {
        return jsonResponse(req, {
          already_linked: true,
          patient_id: patient.id,
          message: "Patient is already linked and consent is active",
        });
      }

      // Generate OTP
      const isDemoMode = getEnv("DEMO_MODE", "true") === "true";
      const demoOtp = getEnv("DEMO_OTP", "587315");
      const pepper = getEnv("OTP_PEPPER", "medlink-default-pepper-2026");
      const generatedCode = isDemoMode ? demoOtp : generateOtp();

      const challengeId = crypto.randomUUID();
      const otpHash = await hashOtp(generatedCode, pepper, challengeId);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await admin.from("otp_challenges").insert({
        id: challengeId,
        profile_id: patient.id,
        purpose: "link",
        otp_hash: otpHash,
        expires_at: expiresAt,
        attempts: 0,
        consumed: false,
        meta: { doctor_id: doctorProfile.id, doctor_name: doctorProfile.full_name },
      });

      const initials = patient.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();

      console.log(`[LINK-PATIENT] OTP for patient ${patient.full_name}: ${generatedCode}`);

      return jsonResponse(req, {
        challenge_id: challengeId,
        patient_preview: {
          id: patient.id,
          name_initials: initials,
          full_name: patient.full_name,
          masked_id: maskTarget(patient.mobile || patient.abha_number || identifier),
        },
      });
    }

    if (step === "confirm") {
      const { challenge_id, otp } = body;
      if (!challenge_id || !otp) {
        return jsonError(req, 400, "missing_fields", "Challenge ID and OTP are required");
      }

      const { data: challenge, error: chErr } = await admin
        .from("otp_challenges")
        .select("*, profiles(*)")
        .eq("id", challenge_id)
        .maybeSingle();

      if (chErr || !challenge) {
        return jsonError(req, 404, "challenge_not_found", "Invalid challenge");
      }

      if (challenge.consumed || new Date(challenge.expires_at).getTime() < Date.now()) {
        return jsonError(req, 410, "challenge_expired", "Verification session expired");
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

      if (!isValid) {
        return jsonError(req, 401, "otp_invalid", "Invalid consent code. Patient must approve linkage.");
      }

      // Mark challenge consumed
      await admin.from("otp_challenges").update({ consumed: true }).eq("id", challenge.id);

      const patientId = challenge.profile_id;
      const doctorId = doctorProfile.id;

      // Upsert link
      const { data: linkRow, error: linkErr } = await admin
        .from("doctor_patient_links")
        .upsert(
          {
            doctor_id: doctorId,
            patient_id: patientId,
            status: "active",
            linked_at: new Date().toISOString(),
            revoked_at: null,
          },
          { onConflict: "doctor_id,patient_id" }
        )
        .select()
        .single();

      if (linkErr) {
        console.error("Link creation error:", linkErr);
        return jsonError(req, 500, "link_failed", "Failed to activate patient link");
      }

      // Notify patient
      await admin.from("notifications").insert({
        user_id: patientId,
        title: "Consent Granted to Doctor",
        body: `${doctorProfile.full_name} now has access to your medical records for consultation.`,
        kind: "consent",
        link: "/patient/profile",
      });

      // Audit log
      await admin.rpc("write_audit", {
        actor: doctorId,
        action: "link",
        entity: "doctor_patient_links",
        entity_id: linkRow.id,
        meta: { patient_id: patientId },
      });

      return jsonResponse(req, {
        success: true,
        link: linkRow,
        patient: challenge.profiles,
      });
    }

    return jsonError(req, 400, "invalid_step", "Step must be 'request' or 'confirm'");
  } catch (err: unknown) {
    console.error("Link patient error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
