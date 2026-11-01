import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getUserAndProfile } from "../_shared/supabase.ts";
import { buildBundle } from "../_shared/fhir.ts";

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { profile: doctorProfile, error: authErr } = await getUserAndProfile(req);
    if (authErr || !doctorProfile || doctorProfile.role !== "doctor") {
      return jsonError(req, 403, "forbidden", "Only doctors can publish consultations");
    }

    const { consultation_id } = await req.json();
    if (!consultation_id) {
      return jsonError(req, 400, "missing_consultation_id", "Consultation ID is required");
    }

    const admin = createAdminClient();

    // Fetch consultation with full relations
    const { data: consultation, error: cErr } = await admin
      .from("consultations")
      .select(`
        *,
        patient:profiles!consultations_patient_id_fkey(*),
        diagnoses:consultation_diagnoses(*, disease:disease_mappings(*)),
        medications(*)
      `)
      .eq("id", consultation_id)
      .maybeSingle();

    if (cErr || !consultation) {
      return jsonError(req, 404, "consultation_not_found", "Consultation record not found");
    }

    if (consultation.doctor_id !== doctorProfile.id) {
      return jsonError(req, 403, "forbidden", "You can only publish your own consultations");
    }

    // Verify active link / consent
    const { data: linkActive } = await admin.rpc("is_linked", {
      d: doctorProfile.id,
      p: consultation.patient_id,
    });

    if (!linkActive) {
      return jsonError(req, 403, "no_active_consent", "Cannot publish: patient consent link is not active");
    }

    // Validation checks
    const fieldErrors: Record<string, string> = {};

    const vitals = consultation.vitals || {};
    if (!vitals.bp || !/^\d{2,3}\/\d{2,3}$/.test(String(vitals.bp).trim())) {
      fieldErrors.bp = "Valid blood pressure (e.g. 120/80) is required";
    }
    if (!vitals.heartRate || isNaN(Number(vitals.heartRate))) {
      fieldErrors.heartRate = "Valid heart rate is required";
    }

    const confirmedDiagnoses = (consultation.diagnoses || []).filter(
      (d: any) => d.confirmed_by_doctor
    );

    if (confirmedDiagnoses.length === 0) {
      fieldErrors.diagnoses = "At least one diagnosis with doctor-confirmed AYUSH/ICD codes is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return jsonError(req, 422, "validation_failed", "Please fix consultation validation errors", fieldErrors);
    }

    const publishedAt = new Date().toISOString();

    // Build FHIR Bundle
    const { bundle, validation } = buildBundle(
      {
        id: consultation.id,
        started_at: consultation.started_at,
        published_at: publishedAt,
        chief_complaint: consultation.chief_complaint,
        vitals: consultation.vitals,
      },
      consultation.patient,
      doctorProfile,
      consultation.diagnoses || [],
      consultation.medications || []
    );

    // Upsert FHIR bundle
    await admin.from("fhir_bundles").upsert(
      {
        consultation_id: consultation.id,
        bundle,
        version: 1,
        published: true,
        validation,
      },
      { onConflict: "consultation_id" }
    );

    // Update consultation to published
    const { data: updatedConsultation, error: updateErr } = await admin
      .from("consultations")
      .update({
        status: "published",
        published_at: publishedAt,
      })
      .eq("id", consultation.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Consultation update error:", updateErr);
      return jsonError(req, 500, "update_failed", "Failed to update consultation status");
    }

    // If associated with an appointment, mark appointment as completed
    if (consultation.appointment_id) {
      await admin
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", consultation.appointment_id);
    }

    // Notify patient
    await admin.from("notifications").insert({
      user_id: consultation.patient_id,
      title: "New Consultation Published",
      body: `Dr. ${doctorProfile.full_name} has finalized your medical records and FHIR bundle.`,
      kind: "record",
      link: "/patient/records",
    });

    // Audit log
    await admin.rpc("write_audit", {
      actor: doctorProfile.id,
      action: "publish",
      entity: "consultations",
      entity_id: consultation.id,
      meta: { fhir_bundle_valid: validation.ok, diagnoses_count: confirmedDiagnoses.length },
    });

    return jsonResponse(req, {
      consultation: updatedConsultation,
      bundle,
      validation,
    });
  } catch (err: unknown) {
    console.error("Publish consultation error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error during publishing");
  }
});
