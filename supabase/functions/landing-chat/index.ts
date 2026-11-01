import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonResponse } from "../_shared/errors.ts";
import { callGemini } from "../_shared/gemini.ts";

const KB = [
  {
    q: "What is MedLink?",
    a: "MedLink is a FHIR-native dual-coding platform. A doctor types a diagnosis and MedLink shows the equivalent terms in Ayurveda, Siddha, Unani and WHO ICD-11, each with a confidence score. The consultation becomes a validated HL7 FHIR R4 Bundle any EMR, insurer or government system can read.",
    keywords: ["medlink", "what is", "about", "platform", "project"],
  },
  {
    q: "How does the dual-coding work?",
    a: "The SETU engine embeds the query (MiniLM, 384-d), searches a vector index and keyword index side by side, fuses the rankings, and returns the closest Ayurveda, Siddha, Unani and ICD-11 terms with per-system confidence. The doctor confirms, and all four codings are written into one FHIR Condition.",
    keywords: ["dual", "coding", "work", "how", "setu", "engine", "search", "map"],
  },
  {
    q: "What systems are covered?",
    a: "Ayurveda, Siddha and Unani, mapped to WHO ICD-11 — 36,782 mappings in total.",
    keywords: ["systems", "covered", "ayurveda", "siddha", "unani", "mappings", "36,782"],
  },
  {
    q: "Is this production-ready?",
    a: "MedLink is a university prototype (PBL 2026–27). It runs on sample data, is not a certified medical device, and is not for clinical use yet.",
    keywords: ["production", "ready", "certified", "clinical", "prototype", "use"],
  },
  {
    q: "Is my data safe?",
    a: "Yes. MedLink implements consent-first record sharing, row-level security on all database tables, and a tamper-evident hash-chained audit log. Only linked doctors can view a patient's records.",
    keywords: ["safe", "security", "privacy", "data", "protect", "consent", "audit"],
  },
];

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return jsonError(req, 405, "method_not_allowed", "Method not allowed");
  }

  try {
    const body = await req.json();
    const query = (body.query || body.message || "").trim();

    if (!query) {
      return jsonError(req, 400, "query_required", "Query is required");
    }

    // Try Gemini if available
    try {
      const kbContext = KB.map((k) => `Q: ${k.q}\nA: ${k.a}`).join("\n\n");
      const systemInstruction = `You are the MedLink Landing Assistant. Answer questions about MedLink strictly grounded in this Knowledge Base:\n${kbContext}\nIf the answer is unknown, politely refer to the MedLink documentation.`;
      const answer = await callGemini(query, systemInstruction);
      if (answer && answer.trim()) {
        return jsonResponse(req, { answer: answer.trim() });
      }
    } catch {
      // Fallback to keyword matching
    }

    const qLower = query.toLowerCase();
    let bestMatch = KB[0];
    let maxScore = -1;

    for (const item of KB) {
      let score = 0;
      for (const kw of item.keywords) {
        if (qLower.includes(kw)) score += 1;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }

    const answer =
      maxScore > 0
        ? bestMatch.a
        : "MedLink is a FHIR-native dual-coding platform bridging ICD-11 with Ayurveda, Siddha, and Unani medicine. Ask me about how dual-coding works, our 36,782 mappings, or patient consent!";

    return jsonResponse(req, { answer });
  } catch (err: unknown) {
    console.error("Landing chat error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
