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
    const { profile: patientProfile, error: authErr } = await getUserAndProfile(req);
    if (authErr || !patientProfile || patientProfile.role !== "patient") {
      return jsonError(req, 403, "forbidden", "Only patients can book appointments");
    }

    const body = await req.json();
    const { action = "book", doctor_id, starts_at, type = "New Consultation", notes, appointment_id } = body;
    const admin = createAdminClient();

    // 1. List free slots for a doctor on a specific date
    if (action === "list-slots") {
      const { date } = body; // format YYYY-MM-DD
      if (!doctor_id || !date) {
        return jsonError(req, 400, "missing_fields", "doctor_id and date are required");
      }

      const { data: docDetails } = await admin
        .from("doctor_details")
        .select("working_hours, slot_minutes")
        .eq("user_id", doctor_id)
        .maybeSingle();

      const workingHours = docDetails?.working_hours || {};
      const slotMinutes = docDetails?.slot_minutes || 30;

      const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
        new Date(`${date}T00:00:00Z`).getUTCDay()
      ];

      const daySchedule = workingHours[dayOfWeek];
      if (!daySchedule || !daySchedule.open) {
        return jsonResponse(req, { slots: [], message: "Doctor does not take appointments on this day" });
      }

      // Generate time slots
      const [startH, startM] = (daySchedule.from || "09:00").split(":").map(Number);
      const [endH, endM] = (daySchedule.to || "17:00").split(":").map(Number);

      const slots: { starts_at: string; available: boolean; time: string }[] = [];
      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      const startOfDay = new Date(`${date}T00:00:00Z`).toISOString();
      const endOfDay = new Date(`${date}T23:59:59Z`).toISOString();

      const { data: existingAppts } = await admin
        .from("appointments")
        .select("starts_at")
        .eq("doctor_id", doctor_id)
        .gte("starts_at", startOfDay)
        .lte("starts_at", endOfDay)
        .in("status", ["pending", "approved"]);

      const bookedSet = new Set(
        (existingAppts || []).map((a) => new Date(a.starts_at).toISOString())
      );

      while (currentMinutes + slotMinutes <= endMinutes) {
        const hh = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
        const mm = (currentMinutes % 60).toString().padStart(2, "0");
        const slotIso = new Date(`${date}T${hh}:${mm}:00Z`).toISOString();

        const isPast = new Date(slotIso).getTime() < Date.now();
        const isBooked = bookedSet.has(slotIso);

        slots.push({
          starts_at: slotIso,
          time: `${hh}:${mm}`,
          available: !isPast && !isBooked,
        });

        currentMinutes += slotMinutes;
      }

      return jsonResponse(req, { slots });
    }

    // 2. Reschedule
    if (action === "reschedule") {
      if (!appointment_id || !starts_at) {
        return jsonError(req, 400, "missing_fields", "appointment_id and new starts_at are required");
      }

      if (new Date(starts_at).getTime() < Date.now()) {
        return jsonError(req, 400, "past_date", "Cannot reschedule to a past date/time");
      }

      const { data: updated, error: reschedErr } = await admin
        .from("appointments")
        .update({
          starts_at,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment_id)
        .eq("patient_id", patientProfile.id)
        .select()
        .single();

      if (reschedErr || !updated) {
        return jsonError(req, 400, "reschedule_failed", "Slot may already be booked or invalid appointment");
      }

      await admin.rpc("write_audit", {
        actor: patientProfile.id,
        action: "reschedule_appointment",
        entity: "appointments",
        entity_id: appointment_id,
        meta: { new_starts_at: starts_at },
      });

      return jsonResponse(req, { appointment: updated, message: "Appointment rescheduled" });
    }

    // 3. New booking
    if (!doctor_id || !starts_at) {
      return jsonError(req, 400, "missing_fields", "doctor_id and starts_at are required");
    }

    if (new Date(starts_at).getTime() < Date.now()) {
      return jsonError(req, 400, "past_date", "Cannot book an appointment in the past");
    }

    // Check doctor existence
    const { data: doctor } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("id", doctor_id)
      .eq("role", "doctor")
      .maybeSingle();

    if (!doctor) {
      return jsonError(req, 404, "doctor_not_found", "Doctor not found");
    }

    // Insert appointment
    const { data: appt, error: insErr } = await admin
      .from("appointments")
      .insert({
        doctor_id,
        patient_id: patientProfile.id,
        starts_at,
        duration_min: 30,
        type,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (insErr) {
      console.error("Booking error:", insErr);
      return jsonError(
        req,
        409,
        "slot_unavailable",
        "The selected slot is already booked or conflicting. Please choose another slot."
      );
    }

    // Notify doctor
    await admin.from("notifications").insert({
      user_id: doctor_id,
      title: "New Appointment Request",
      body: `${patientProfile.full_name} has requested an appointment for ${new Date(starts_at).toLocaleDateString()}.`,
      kind: "appointment",
      link: "/doctor/appointments",
    });

    // Audit log
    await admin.rpc("write_audit", {
      actor: patientProfile.id,
      action: "book_appointment",
      entity: "appointments",
      entity_id: appt.id,
      meta: { doctor_id, starts_at, type },
    });

    return jsonResponse(req, {
      appointment: appt,
      message: "Appointment booked successfully. Awaiting doctor confirmation.",
    });
  } catch (err: unknown) {
    console.error("Book appointment error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
