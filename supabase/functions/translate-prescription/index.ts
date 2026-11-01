import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { createAdminClient, getUserAndProfile } from "../_shared/supabase.ts";
import { callGemini } from "../_shared/gemini.ts";

const FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    "Take 1 tablet after meals": "भोजन के बाद 1 गोली लें",
    "Take after food": "भोजन के बाद लें",
    "Once daily": "दिन में एक बार",
    "Twice daily": "दिन में दो बार",
    "Thrice daily": "दिन में तीन बार",
    "Take with warm water": "गुनगुने पानी के साथ लें",
  },
  ta: {
    "Take 1 tablet after meals": "உணவுக்குப் பிறகு 1 மாத்திரை எடுத்துக் கொள்ளவும்",
    "Take after food": "உணவுக்குப் பிறகு எடுக்கவும்",
    "Once daily": "நாளைக்கு ஒரு முறை",
    "Twice daily": "நாளைக்கு இரண்டு முறை",
    "Take with warm water": "வெதுவெதுப்பான நீரில் எடுக்கவும்",
  },
  te: {
    "Take 1 tablet after meals": "భోజనం తర్వాత 1 టాబ్లెట్ తీసుకోండి",
    "Take after food": "భోజనం తర్వాత తీసుకోండి",
    "Once daily": "రోజుకు ఒకసారి",
    "Twice daily": "రోజుకు రెండుసార్లు",
    "Take with warm water": "గోరువెచ్చని నీటితో తీసుకోండి",
  },
};

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const { profile, error: authErr } = await getUserAndProfile(req);
    if (authErr || !profile) {
      return jsonError(req, 401, "unauthorized", "Authentication required");
    }

    const { medication_ids, lang = "hi" } = await req.json();

    if (!Array.isArray(medication_ids) || medication_ids.length === 0) {
      return jsonError(req, 400, "missing_ids", "Array of medication_ids is required");
    }

    const admin = createAdminClient();

    // 1. Check existing translations in DB
    const { data: cached } = await admin
      .from("prescription_translations")
      .select("*")
      .in("medication_id", medication_ids)
      .eq("lang", lang);

    const result: Record<string, { drug_text: string; instructions_text: string }> = {};
    const missingIds: string[] = [];

    if (cached) {
      for (const row of cached) {
        result[row.medication_id] = {
          drug_text: row.drug_text,
          instructions_text: row.instructions_text,
        };
      }
    }

    for (const id of medication_ids) {
      if (!result[id]) missingIds.push(id);
    }

    if (missingIds.length > 0) {
      // Fetch medications details
      const { data: meds } = await admin
        .from("medications")
        .select("id, drug, dosage, frequency, duration_days, instructions")
        .in("id", missingIds);

      if (meds && meds.length > 0) {
        let aiTranslations: Record<string, { drug_text: string; instructions_text: string }> = {};

        try {
          const prompt = `Translate the following prescription medications and patient instructions into language code "${lang}".
Return ONLY a valid JSON object where keys are the medication IDs and values have {"drug_text": "...", "instructions_text": "..."}.
Medications to translate:
${JSON.stringify(
  meds.map((m) => ({
    id: m.id,
    drug: m.drug,
    instructions: `${m.dosage} (${m.frequency.toUpperCase()}) for ${m.duration_days} days. ${m.instructions || ""}`.trim(),
  })),
  null,
  2
)}`;
          const responseText = await callGemini(
            prompt,
            "You are a professional medical translator. Translate drug names and instructions faithfully into Indian languages. Respond with valid JSON only."
          );

          const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          aiTranslations = JSON.parse(cleanedJson);
        } catch (geminiErr) {
          console.warn("Gemini translation failed, using fallback:", geminiErr);
        }

        // Apply translations (AI or fallback) and insert into DB
        for (const m of meds) {
          const trans = aiTranslations[m.id];
          const instructions = `${m.dosage} (${m.frequency.toUpperCase()}) for ${m.duration_days} days. ${m.instructions || ""}`.trim();
          const fallbackInstructions =
            (FALLBACK_TRANSLATIONS[lang] && FALLBACK_TRANSLATIONS[lang][m.instructions || ""]) ||
            instructions;

          const finalDrugText = trans?.drug_text || m.drug;
          const finalInstText = trans?.instructions_text || fallbackInstructions;

          result[m.id] = {
            drug_text: finalDrugText,
            instructions_text: finalInstText,
          };

          // Cache in DB
          await admin.from("prescription_translations").upsert(
            {
              medication_id: m.id,
              lang,
              drug_text: finalDrugText,
              instructions_text: finalInstText,
            },
            { onConflict: "medication_id,lang" }
          );
        }
      }
    }

    return jsonResponse(req, {
      lang,
      translations: result,
    });
  } catch (err: unknown) {
    console.error("Prescription translation error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
