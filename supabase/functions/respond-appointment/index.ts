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
      return jsonError(req, 403, "forbidden", "Only doctors can respond to appointments");
    }

    const { appointment_id, decision } = await req.json();

    if (!appointment_id || !decision || !["approved", "rejected"].includes(decision)) {
      return jsonError(req, 400, "invalid_payload", "appointment_id and valid decision ('approved' | 'rejected') are required");
    }

    const admin = createAdminClient();

    const { data: appt, error: apptErr } = await admin
      .from("appointments")
      .select("*, patient:profiles!appointments_patient_id_fkey(*)")
      .eq("id", appointment_id)
      .eq("doctor_id", doctorProfile.id)
      .maybeSingle();

    if (apptErr || !appt) {
      return jsonError(req, 404, "appointment_not_found", "Appointment not found for this doctor");
    }

    const { data: updated, error: updateErr } = await admin
      .from("appointments")
      .update({
        status: decision,
        decided_at: new Date().toISOString(),
      })
      .eq("id", appointment_id)
      .select()
      .single();

    if (updateErr) {
      console.error("Respond appointment error:", updateErr);
      return jsonError(req, 500, "update_failed", "Failed to update appointment status");
    }

    // If approved, also ensure doctor-patient link exists
    if (decision === "approved") {
      await admin.from("doctor_patient_links").upsert(
        {
          doctor_id: doctorProfile.id,
          patient_id: appt.patient_id,
          status: "active",
          linked_at: new Date().toISOString(),
        },
        { onConflict: "doctor_id,patient_id" }
      );
    }

    // Notify patient
    const title = decision === "approved" ? "Appointment Approved" : "Appointment Declined";
    const bodyText =
      decision === "approved"
        ? `Dr. ${doctorProfile.full_name} confirmed your appointment for ${new Date(appt.starts_at).toLocaleString()}.`
        : `Dr. ${doctorProfile.full_name} was unable to accept your appointment request.`;

    await admin.from("notifications").insert({
      user_id: appt.patient_id,
      title,
      body: bodyText,
      kind: "appointment",
      link: "/patient/appointments",
    });

    // Audit log
    await admin.rpc("write_audit", {
      actor: doctorProfile.id,
      action: `appointment_${decision}`,
      entity: "appointments",
      entity_id: appt.id,
      meta: { decision, patient_id: appt.patient_id },
    });

    return jsonResponse(req, {
      appointment: updated,
      message: `Appointment ${decision} successfully`,
    });
  } catch (err: unknown) {
    console.error("Respond appointment error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
