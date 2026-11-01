import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { jsonError } from "../_shared/errors.ts";
import { createAdminClient, getUserAndProfile } from "../_shared/supabase.ts";
import { streamGemini } from "../_shared/gemini.ts";

const SYSTEM_PROMPT = `You are MedLink AI — an expert medical coding assistant embedded in the MedLink Hospital Management Platform.

## STRICT SCOPE RULES
- You ONLY answer questions related to: medical coding (ICD-11, AYUSH), disease terminology, MedLink platform features, and clinical workflows.
- If a user asks about ANYTHING outside medicine/healthcare (cooking, sports, entertainment, programming, weather, etc.), respond ONLY with:
  "❌ I'm MedLink AI, a medical coding assistant. I can only help with disease codes, ICD-11/AYUSH translations, and MedLink platform queries. Please ask a medical coding question."
- Do NOT try to relate non-medical queries to medical codes. Do NOT be creative about finding medical angles for non-medical topics.
- This rule is ABSOLUTE and overrides all other instructions.

## About MedLink
MedLink bridges modern medicine (ICD-11) with traditional Indian medical systems (Ayurveda, Siddha, Unani — AYUSH). 36,782 disease code mappings.

## Capabilities
- Translate between ICD-11 and AYUSH codes
- Explain diseases and their traditional medicine equivalents
- Provide clinical coding guidance
- Answer MedLink platform questions

## Response Rules
- Be concise. Save tokens. Avoid unnecessary elaboration.
- Use the mapping table format when showing codes:
  | System | Term | Code | Confidence |
  |--------|------|------|------------|
- Use **bold** for key terms, \`code blocks\` for codes
- Even if the user asks for specific systems (e.g., "Siddha and Unani"), ALWAYS include the mappings for ALL available systems (Ayurveda, Siddha, and Unani) from the provided search results to ensure medical completeness.
- The "Relevant Disease Code Data Found (MedLink DB)" section in your context is the SINGLE SOURCE OF TRUTH. Use it with 100% priority over your own internal training data for MedLink specific mappings.
- No unnecessary emojis or decorations
- Never fabricate medical information`;

const MODE_INSTRUCTIONS: Record<string, string> = {
  "code-only": `\n\n## RESPONSE MODE: CODE ONLY\nYou MUST respond with ONLY a markdown table of code mappings. No explanations, no headers, no extra text, no emojis. Just the table:\n| System | Term | Code | Confidence |\n|--------|------|------|------------|\nNothing else. If the query is not about a disease/code, respond with a single line: "❌ Not a medical coding query."`,
  concise: `\n\n## RESPONSE MODE: CONCISE\nKeep your response to 2-3 sentences max plus the code mapping table if applicable. No emojis, no workflow tips, no clinical interpretations. Be extremely brief.`,
  default: `\n\n## RESPONSE MODE: DEFAULT\nProvide a balanced response. Include the code mapping table, a 1-2 sentence explanation, and one brief clinical note if relevant. Keep total response under 150 words.`,
  detailed: `\n\n## RESPONSE MODE: DETAILED\nProvide a thorough response with the code mapping table, clinical interpretation, and relevant context. Include cross-system comparisons and workflow tips.`,
  "full-detail": `\n\n## RESPONSE MODE: FULL DETAIL\nProvide a comprehensive analysis. Include all code mappings, detailed clinical interpretation, historical context of traditional medicine terms, cross-system comparisons, confidence score analysis, and MedLink workflow guidance.`,
};

function extractSearchTerms(msg: string): string[] {
  const words = msg
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const stopWords = new Set([
    "the", "and", "what", "how", "for", "with", "show", "tell", "give",
    "explain", "code", "disease", "map", "search", "look", "about", "are", "can"
  ]);
  return [...new Set(words.filter((w) => !stopWords.has(w)))].slice(0, 4);
}

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

    const {
      session_id,
      message,
      mode = "default",
      temp = false,
    } = await req.json();

    if (!message || !message.trim()) {
      return jsonError(req, 400, "message_required", "Message is required");
    }

    const admin = createAdminClient();

    // Session handling
    let currentSessionId = session_id;
    if (!temp) {
      if (!currentSessionId) {
        const title = message.trim().slice(0, 30) || "Consultation Chat";
        const { data: newSession } = await admin
          .from("chat_sessions")
          .insert({
            user_id: profile.id,
            title,
            is_temp: false,
          })
          .select("id")
          .single();
        if (newSession) currentSessionId = newSession.id;
      }

      if (currentSessionId) {
        await admin.from("chat_messages").insert({
          session_id: currentSessionId,
          role: "user",
          content: message.trim(),
          mode,
        });
      }
    }

    // Server-side RAG: search diseases
    const terms = extractSearchTerms(message);
    const ragMap = new Map<number, any>();

    for (const term of terms) {
      const { data: matches } = await admin.rpc("search_diseases", {
        q: term,
        lim: 5,
      });
      if (matches) {
        for (const m of matches) {
          if (!ragMap.has(m.id) && ragMap.size < 15) {
            ragMap.set(m.id, m);
          }
        }
      }
    }

    const ragRows = Array.from(ragMap.values());
    let ragContext = "";
    if (ragRows.length > 0) {
      ragContext = `\n\n## Relevant Disease Code Data Found (MedLink DB):\n` +
        ragRows
          .map(
            (r) =>
              `- ICD-11: ${r.icd11_title} [${r.icd11_code || "N/A"}] | Ayurveda: ${r.ayurveda_term || "None"} [${r.ayurveda_code || "N/A"}] (${Math.round((r.ayurveda_sim || 0) * 100)}%) | Siddha: ${r.siddha_term || "None"} [${r.siddha_code || "N/A"}] (${Math.round((r.siddha_sim || 0) * 100)}%) | Unani: ${r.unani_term || "None"} [${r.unani_code || "N/A"}] (${Math.round((r.unani_sim || 0) * 100)}%)`
          )
          .join("\n");
    }

    const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.default;
    const fullSystemInstruction = `${SYSTEM_PROMPT}${modeInstruction}${ragContext}`;

    // Prepare SSE Stream
    const encoder = new TextEncoder();
    let accumulatedContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let streamedAny = false;
          try {
            for await (const chunk of streamGemini(message, fullSystemInstruction)) {
              streamedAny = true;
              accumulatedContent += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
              );
            }
          } catch (geminiErr) {
            console.warn("Gemini call failed or unconfigured, using fallback:", geminiErr);
          }

          if (!streamedAny) {
            // Fallback generation from RAG rows
            let fallbackText = "";
            if (ragRows.length > 0) {
              const r = ragRows[0];
              fallbackText = `Here are the official ICD-11 and AYUSH mappings for **${r.icd11_title}**:\n\n` +
                `| System | Term | Code | Confidence |\n` +
                `|--------|------|------|------------|\n` +
                `| ICD-11 | ${r.icd11_title} | \`${r.icd11_code || "N/A"}\` | 100% |\n` +
                `| Ayurveda | ${r.ayurveda_term || "N/A"} | \`${r.ayurveda_code || "N/A"}\` | ${Math.round((r.ayurveda_sim || 0.8) * 100)}% |\n` +
                `| Siddha | ${r.siddha_term || "N/A"} | \`${r.siddha_code || "N/A"}\` | ${Math.round((r.siddha_sim || 0.8) * 100)}% |\n` +
                `| Unani | ${r.unani_term || "N/A"} | \`${r.unani_code || "N/A"}\` | ${Math.round((r.unani_sim || 0.8) * 100)}% |\n\n` +
                `*Grounded in the verified MedLink National Terminology Database.*`;
            } else {
              fallbackText = `I couldn't locate an exact match for "${message}". Please enter a recognized disease title, ICD-11 code, or AYUSH concept (e.g. *Cholera*, *Hypertension*, *1A00*, *Amatisara*).`;
            }

            accumulatedContent = fallbackText;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta: fallbackText })}\n\n`)
            );
          }

          // Persist assistant message
          if (!temp && currentSessionId && accumulatedContent) {
            await admin.from("chat_messages").insert({
              session_id: currentSessionId,
              role: "assistant",
              content: accumulatedContent,
              mode,
            });
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (streamErr) {
          console.error("Stream error:", streamErr);
          controller.error(streamErr);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("AI chat error:", err);
    return jsonError(req, 500, "internal_error", "Internal server error");
  }
});
