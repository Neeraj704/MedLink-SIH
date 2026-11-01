import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getUserAndProfile } from "../_shared/supabase.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { profile: doctorProfile, error: authErr } = await getUserAndProfile(req);
    if (authErr || !doctorProfile || doctorProfile.role !== "doctor") {
      return jsonError(req, 403, "forbidden", "Only doctors can register walk-in patients");
    }

    const { name, mobile, abha, dob, gender } = await req.json();

    if (!name || name.trim().length < 2) {
      return jsonError(req, 400, "invalid_name", "Patient name is required (min 2 characters)");
    }

    const admin = createAdminClient();
    const cleanMobile = mobile ? mobile.replace(/\D/g, "") : null;
    const cleanAbha = abha ? abha.replace(/\D/g, "") : null;

    // Create auth user so foreign key constraint on auth.users is satisfied
    const syntheticUuid = crypto.randomUUID();
    const syntheticEmail = `${syntheticUuid}@walkin.medlink.app`;

    const { data: authUser, error: authCreateErr } = await admin.auth.admin.createUser({
      id: syntheticUuid,
      email: syntheticEmail,
      email_confirm: true,
      user_metadata: { role: "patient", walk_in: true },
    });

    if (authCreateErr || !authUser?.user) {
      console.error("Auth create walk-in error:", authCreateErr);
      return jsonError(req, 500, "user_creation_failed", "Failed to initialize walk-in record");
    }

    // Insert unclaimed profile
    const { data: newProfile, error: profErr } = await admin
      .from("profiles")
      .insert({
        id: syntheticUuid,
        role: "patient",
        full_name: name.trim(),
        mobile: cleanMobile && cleanMobile.length === 10 ? cleanMobile : null,
        abha_number: cleanAbha && cleanAbha.length === 14 ? cleanAbha : null,
        dob: dob || null,
        gender: gender || null,
        email: syntheticEmail,
        claimed: false, // Walk-in patient, can be claimed later
      })
      .select()
      .single();

    if (profErr || !newProfile) {
      console.error("Profile insert error:", profErr);
      return jsonError(req, 500, "profile_failed", "Failed to create patient profile");
    }

    // Auto-link to this doctor
    await admin.from("doctor_patient_links").upsert(
      {
        doctor_id: doctorProfile.id,
        patient_id: newProfile.id,
        status: "active",
        linked_at: new Date().toISOString(),
      },
      { onConflict: "doctor_id,patient_id" }
    );

    // Identifiers
    if (cleanAbha && cleanAbha.length === 14) {
      await admin.from("patient_identifiers").insert({
        patient_id: newProfile.id,
        type: "abha",
        value: cleanAbha,
      });
    }
    if (cleanMobile && cleanMobile.length === 10) {
      await admin.from("patient_identifiers").insert({
        patient_id: newProfile.id,
        type: "phone",
        value: cleanMobile,
      });
    }

    // Audit log
    await admin.rpc("write_audit", {
      actor: doctorProfile.id,
      action: "create_patient",
      entity: "profiles",
      entity_id: newProfile.id,
      meta: { walk_in: true, doctor_id: doctorProfile.id },
    });

    return jsonResponse(req, {
      profile: newProfile,
      message: "Walk-in patient registered and linked successfully",
    });
  } catch (err: unknown) {
    console.error("Create patient error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
