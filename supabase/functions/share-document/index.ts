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
      return jsonError(req, 403, "forbidden", "Only patients can manage document sharing");
    }

    const { document_id, doctor_id, shared } = await req.json();

    if (!document_id || !doctor_id || typeof shared !== "boolean") {
      return jsonError(req, 400, "missing_fields", "document_id, doctor_id, and boolean shared are required");
    }

    const admin = createAdminClient();

    // Verify document belongs to patient
    const { data: doc, error: docErr } = await admin
      .from("documents")
      .select("id, name")
      .eq("id", document_id)
      .eq("patient_id", patientProfile.id)
      .maybeSingle();

    if (docErr || !doc) {
      return jsonError(req, 404, "document_not_found", "Document not found or does not belong to you");
    }

    // Verify active link with doctor
    const { data: linkActive } = await admin.rpc("is_linked", {
      d: doctor_id,
      p: patientProfile.id,
    });

    if (!linkActive) {
      return jsonError(req, 403, "not_linked", "Cannot share document: you do not have an active consent link with this doctor");
    }

    if (shared) {
      // Upsert share
      await admin.from("document_shares").upsert(
        { document_id, doctor_id },
        { onConflict: "document_id,doctor_id" }
      );

      // Notify doctor
      await admin.from("notifications").insert({
        user_id: doctor_id,
        title: "Medical Document Shared",
        body: `${patientProfile.full_name} shared "${doc.name}" with you.`,
        kind: "document",
        link: `/doctor/patients/${patientProfile.id}`,
      });

      await admin.rpc("write_audit", {
        actor: patientProfile.id,
        action: "share_document",
        entity: "documents",
        entity_id: document_id,
        meta: { doctor_id, shared: true },
      });
    } else {
      // Remove share
      await admin
        .from("document_shares")
        .delete()
        .eq("document_id", document_id)
        .eq("doctor_id", doctor_id);

      await admin.rpc("write_audit", {
        actor: patientProfile.id,
        action: "unshare_document",
        entity: "documents",
        entity_id: document_id,
        meta: { doctor_id, shared: false },
      });
    }

    return jsonResponse(req, {
      success: true,
      shared,
      message: shared ? "Document shared with doctor" : "Document sharing revoked",
    });
  } catch (err: unknown) {
    console.error("Share document error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
