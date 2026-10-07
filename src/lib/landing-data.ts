export const LINKS = {
  live: "https://medlink-sih.vercel.app/",
  github: "https://github.com/neeraj704/medlink-sih", // team: confirm
  demo: "#", // team: paste demo video URL
  nhcx: "#",
};

export const ASSISTANT_API =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_ML_API_URL) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ML_API_URL) ||
  "";

export const SIGNIN_ROUTE = "/signin";
export const SIGNUP_ROUTE = "/signup";
export const AUTH_ROUTE = SIGNUP_ROUTE;
export const DEMO_OTP = "587315";
export const PROTOTYPE_TIP = `Prototype tip: sign in with any ID — the demo OTP is ${DEMO_OTP}.`;
export const SAMPLE_CAPTION = "Interface preview with sample data.";

/* ------------------------------------------------------------------ */
/* Status map — flip any chip here, in one place.                       */
/* ------------------------------------------------------------------ */
export type Status = "live" | "roadmap";

export const STATUS = {
  translation: "live",
  hybridSearch: "live",
  consultDesk: "live",
  fhirBundle: "live",
  aiAssistant: "live",
  doctorPortal: "live",
  patientPortal: "live",
  demoAuth: "live",
  theme: "live",
  rerank: "roadmap",
  abdmLive: "roadmap",
  nhcx: "roadmap",
  ocr: "roadmap",
  voice: "roadmap",
  pwa: "roadmap",
  auditLedger: "roadmap",
  analytics: "roadmap",
  smartOnFhir: "roadmap",
  bhashini: "roadmap",
  rls: "live",
} as const satisfies Record<string, Status>;

export type FeatureKey = keyof typeof STATUS;

export const STATUS_LABEL: Record<Status, string> = {
  live: "Live in prototype",
  roadmap: "On the roadmap",
};

/* ------------------------------------------------------------------ */
/* Personas                                                             */
/* ------------------------------------------------------------------ */
export type Persona = "doctor" | "patient" | "policy" | "explorer";

export const PERSONAS: {
  id: Persona;
  label: string;
  short: string;
  description: string;
  heroLink: { label: string; href: string } | null;
  recommended: string[];
}[] = [
  {
    id: "doctor",
    label: "Doctor / Practitioner",
    short: "Doctor",
    description: "Faster coding inside the consultation.",
    heroLink: { label: "See the Consultation Desk", href: "#doctors" },
    recommended: ["how", "ai", "doctors"],
  },
  {
    id: "patient",
    label: "Patient",
    short: "Patient",
    description: "Records you own, in your language.",
    heroLink: { label: "See your health record", href: "#patients" },
    recommended: ["patients", "trust", "bharat"],
  },
  {
    id: "policy",
    label: "Policy · Insurance · Research",
    short: "Policy",
    description: "Claims, morbidity data and the national stack.",
    heroLink: { label: "See the national impact", href: "#impact" },
    recommended: ["problem", "impact", "numbers", "stack"],
  },
  {
    id: "explorer",
    label: "Just exploring",
    short: "Explorer",
    description: "Show me everything.",
    heroLink: null,
    recommended: [],
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */
export const NAV_LINKS = [
  { id: "problem", label: "Problem" },
  { id: "how", label: "How it works" },
  { id: "engine", label: "Engine" },
  { id: "fhir", label: "FHIR" },
  { id: "ai", label: "AI" },
  { id: "doctors", label: "Portals" },
  { id: "trust", label: "Trust" },
  { id: "architecture", label: "Architecture" },
  { id: "impact", label: "Impact" },
];

/* ------------------------------------------------------------------ */
/* Glossary                                                             */
/* ------------------------------------------------------------------ */
export const GLOSSARY: Record<string, { term: string; meaning: string }> = {
  Ayush: { term: "Ayush", meaning: "Ayurveda, Yoga & Naturopathy, Unani, Siddha, Homoeopathy — India's traditional medicine systems. MedLink covers Ayurveda, Siddha and Unani." },
  NAMASTE: { term: "NAMASTE", meaning: "National AYUSH Morbidity & Standardized Terminologies Electronic — the national Ayush vocabulary portal (namstp.ayush.gov.in)." },
  NAMC: { term: "NAMC", meaning: "National AYUSH Morbidity Codes — used for Ayurveda and Siddha terms." },
  NUMC: { term: "NUMC", meaning: "National Unani Morbidity Codes — used for Unani terms." },
  "ICD-11": { term: "ICD-11", meaning: "WHO's International Classification of Diseases, 11th revision." },
  TM2: { term: "TM2", meaning: "ICD-11's Traditional Medicine module (Chapter 26, Module 2)." },
  "HL7 FHIR R4": { term: "HL7 FHIR R4", meaning: "Fast Healthcare Interoperability Resources, release 4 — the modern JSON standard for exchanging health records." },
  "SMART-on-FHIR": { term: "SMART-on-FHIR", meaning: "An OAuth2-based standard for apps to securely access FHIR data." },
  ABDM: { term: "ABDM", meaning: "Ayushman Bharat Digital Mission — India's national digital health ecosystem." },
  ABHA: { term: "ABHA", meaning: "Ayushman Bharat Health Account — a patient's 14-digit national health ID." },
  HPR: { term: "HPR", meaning: "Healthcare Professionals Registry — verified doctor identity." },
  HFR: { term: "HFR", meaning: "Health Facility Registry — the national registry of health facilities." },
  HIP: { term: "HIP", meaning: "Health Information Provider — the ABDM role that shares records with consent." },
  NHCX: { term: "NHCX", meaning: "National Health Claims Exchange — insurance claims on ICD codes." },
  DISHA: { term: "DISHA", meaning: "Digital Information Security in Healthcare Act — India's digital health-data security framework." },
  DPDP: { term: "DPDP", meaning: "Digital Personal Data Protection Act, India." },
  Bhashini: { term: "Bhashini", meaning: "India's national language-technology mission for translation and speech." },
  RAG: { term: "RAG", meaning: "Retrieval-Augmented Generation — an LLM that answers only from retrieved, verified documents." },
  ANN: { term: "ANN", meaning: "Approximate-nearest-neighbour vector search." },
  BM25: { term: "BM25", meaning: "Classic keyword (lexical) ranking." },
  RRF: { term: "RRF", meaning: "Reciprocal Rank Fusion — merges the semantic and keyword rankings into one." },
  PWA: { term: "PWA", meaning: "Progressive Web App — installable, works offline." },
  "EHR Standards 2016": { term: "EHR Standards 2016", meaning: "India's Electronic Health Record Standards notified by the Ministry of Health in 2016." },
};

export const MARQUEE_ROWS: string[][] = [
  ["ABDM", "ABHA", "HPR", "HFR", "NHCX", "HL7 FHIR R4", "SMART-on-FHIR"],
  ["ICD-11", "TM2", "NAMASTE", "EHR Standards 2016", "DISHA", "DPDP", "Bhashini"],
];

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */
export const HERO = {
  eyebrow: "FHIR R4 · WHO ICD-11 · NAMASTE",
  lines: ["One diagnosis.", "Four vocabularies.", "Zero barriers."],
  sub: "MedLink translates Ayurveda, Siddha and Unani diagnoses into WHO ICD-11 — in real time, inside the doctor's workflow.",
  rails: "Built on India's national health rails — ABDM · ABHA · HPR · FHIR R4 · ICD-11.",
  notice: "University prototype · PBL 2026–27 · Manipal University Jaipur",
  chips: [
    { system: "ayurveda", term: "Grahani", label: "Ayurveda" },
    { system: "siddha", term: "Kirani", label: "Siddha" },
    { system: "unani", term: "Ishaal", label: "Unani" },
  ] as const,
  core: { term: "Gastroenteritis", label: "ICD-11" },
};

/* ------------------------------------------------------------------ */
/* Problem                                                              */
/* ------------------------------------------------------------------ */
export const PROBLEM = {
  title: "Two languages of care. One broken conversation.",
  sub: "India heals with Ayurveda, Siddha, Unani and modern medicine — side by side. Their records don't speak to each other.",
  beats: [
    { title: "A vaidya writes “Agnimandya.”", body: "Precise in Ayurveda. A complete diagnosis, written in the language of its tradition." },
    { title: "The hospital EMR only reads ICD-11.", body: "To the hospital's system, the word means nothing. The insight is lost at the door." },
    { title: "The insurer needs an ICD code.", body: "Claims run on ICD codes. Without a mapping, the Ayush claim waits for manual coding." },
    { title: "The Ministry asks a simple question.", body: "Which conditions does Unani treat most, and where? Today, nobody can answer." },
  ],
  breaks: [
    { title: "Documentation gap", body: "“Agnimandya” is precise in Ayurveda, but unintelligible to an EMR, insurer or researcher who reads only ICD-11 — where it is Dyspepsia." },
    { title: "Fragmented records", body: "Insights from an Ayush consultation are lost when the patient visits an allopathic hospital. There is no standard way to share them." },
    { title: "Claims friction", body: "Health-insurance claims run on ICD codes. Without a mapping, Ayush claims are manual, slow and often rejected." },
    { title: "Data & research deficit", body: "The Ministry of Ayush lacks large-scale, standardized morbidity data to plan, fund and research." },
  ],
  closing: "MedLink makes them one.",
};

/* ------------------------------------------------------------------ */
/* Rosetta demo                                                         */
/* ------------------------------------------------------------------ */
export type SystemKey = "icd" | "ayurveda" | "siddha" | "unani";

export const SYSTEMS: Record<SystemKey, { label: string; codeSystem: string; vocab: string }> = {
  icd: { label: "ICD-11", codeSystem: "http://id.who.int/icd/release/11", vocab: "WHO ICD-11" },
  ayurveda: { label: "Ayurveda", codeSystem: "http://ayush.gov.in/namc/ayurveda", vocab: "NAMC" },
  siddha: { label: "Siddha", codeSystem: "http://ayush.gov.in/namc/siddha", vocab: "NAMC" },
  unani: { label: "Unani", codeSystem: "http://ayush.gov.in/numc/unani", vocab: "NUMC" },
};

export type Translation =
  | { kind: "match"; term: string; confidence: number }
  | { kind: "low" }
  | { kind: "open" };

export type RosettaEntry = {
  id: string;
  chip: string;
  keywords: string[];
  icd: { title: string; code: string };
  results: Record<Exclude<SystemKey, "icd">, Translation>;
};

export const ROSETTA: RosettaEntry[] = [
  {
    id: "gastro",
    chip: "Gastroenteritis",
    keywords: ["gastroenteritis", "gastro", "grahani", "kirani", "ishaal"],
    icd: { title: "Gastroenteritis", code: "••••" },
    results: {
      ayurveda: { kind: "match", term: "Grahani", confidence: 92 },
      siddha: { kind: "match", term: "Kirani", confidence: 88 },
      unani: { kind: "match", term: "Ishaal", confidence: 90 },
    },
  },
  {
    id: "dyspepsia",
    chip: "Dyspepsia / Agnimandya",
    keywords: ["dyspepsia", "agnimandya", "agnimaandya", "mg51", "indigestion"],
    icd: { title: "Dyspepsia", code: "MG51" },
    results: {
      ayurveda: { kind: "match", term: "Agnimandya", confidence: 91 },
      siddha: { kind: "low" },
      unani: { kind: "low" },
    },
  },
  {
    id: "cholera",
    chip: "Cholera · 1A00",
    keywords: ["cholera", "1a00"],
    icd: { title: "Cholera", code: "1A00" },
    results: { ayurveda: { kind: "open" }, siddha: { kind: "open" }, unani: { kind: "open" } },
  },
];

export const ROSETTA_COPY = {
  eyebrow: "The idea",
  title: "One diagnosis. Four vocabularies.",
  sub: "Type a diagnosis. MedLink returns the equivalent term in Ayurveda, Siddha, Unani and ICD-11 — with a confidence score for each.",
  placeholder: "Search disease by name or ICD-11 code… (e.g., Cholera, 1A00)",
  empty: "The live app searches all 36,782 mappings.",
  caption: "Illustrative confidence · Interface preview with sample data.",
  principles: [
    { title: "Confidence-scored, not forced", body: "Semantic similarity enables safe mappings without forced 1:1 matches. Low confidence triggers review." },
    { title: "Doctor stays in control", body: "MedLink suggests. The doctor confirms every mapping before it enters the record." },
    { title: "Every code traces to a source row", body: "Every result is retrieved from the verified index — never generated." },
  ],
};

/* ------------------------------------------------------------------ */
/* Pipeline                                                             */
/* ------------------------------------------------------------------ */
export const PIPELINE_COPY = {
  eyebrow: "How it works",
  title: "From first word to FHIR record.",
  sub: "Seven steps. Under a second where it counts.",
};

export const PIPELINE: { title: string; body: string; chips: { label: string; feature: FeatureKey }[] }[] = [
  {
    title: "Secure Identity Gateway",
    body: "Patients sign in with ABHA OTP. Doctors verify with HPR. OAuth2 + JWT sessions and Row-Level Security keep every record scoped.",
    chips: [
      { label: "Role-based sign-in", feature: "demoAuth" },
      { label: "Live ABHA / HPR gateway", feature: "abdmLive" },
    ],
  },
  {
    title: "Clinical Capture",
    body: "Vitals, complaint, history and prescription in one form. Voice dictation in 11 Indian languages and OCR import of paper records, with doctor verification.",
    chips: [
      { label: "Consultation Desk", feature: "consultDesk" },
      { label: "Voice dictation", feature: "voice" },
      { label: "OCR import", feature: "ocr" },
    ],
  },
  {
    title: "Hybrid Semantic Search",
    body: "A 250 ms debounce, then a MiniLM-L6-v2 384-d embedding, Pinecone ANN and BM25 lexical search side by side, and a cross-encoder re-rank.",
    chips: [
      { label: "Embeddings + ANN", feature: "hybridSearch" },
      { label: "Cross-encoder re-rank", feature: "rerank" },
    ],
  },
  {
    title: "Dual-Code Mapping",
    body: "ICD-11 ↔ Ayurveda · Siddha · Unani across 36,782 mappings, with a confidence score per system. Multiple diagnoses per visit.",
    chips: [{ label: "Per-system confidence", feature: "translation" }],
  },
  {
    title: "FHIR R4 Bundle Synthesis",
    body: "Patient, Practitioner, Encounter, Observation, Condition with four codings, and MedicationRequest — validated before publish.",
    chips: [{ label: "Bundle generation", feature: "fhirBundle" }],
  },
  {
    title: "Publish & Exchange",
    body: "The bundle goes to the patient portal, EMR/HIS, ABDM HIP and NHCX claim flows, with a multilingual PDF prescription.",
    chips: [
      { label: "Patient portal publish", feature: "patientPortal" },
      { label: "NHCX exchange", feature: "nhcx" },
    ],
  },
  {
    title: "Intelligence & Audit",
    body: "A grounded RAG assistant on Gemini 2.5 Flash, de-identified Ayush morbidity analytics and a hash-chained audit log.",
    chips: [
      { label: "MedLink AI", feature: "aiAssistant" },
      { label: "Analytics & audit ledger", feature: "auditLedger" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* SETU engine                                                          */
/* ------------------------------------------------------------------ */
export const SETU = {
  eyebrow: "The engine",
  title: "SETU. The bridge between two ways of healing.",
  sub: "A hybrid retrieval engine that understands what a diagnosis means — not just how it's spelled.",
  note: { word: "सेतु", meaning: "setu — Sanskrit for “bridge”" },
  runtime: [
    { label: "Clinician query" },
    { label: "250 ms debounce" },
    { label: "Query embedding" },
    { label: "Pinecone ANN top-k + BM25" },
    { label: "Reciprocal Rank Fusion" },
    { label: "Cross-encoder re-rank", feature: "rerank" as FeatureKey },
    { label: "Confidence calibration (isotonic)", feature: "rerank" as FeatureKey },
    { label: "Grounded context" },
    { label: "Gemini 2.5 Flash · temp 0 · LangChain" },
    { label: "Structured dual-code answer" },
  ],
  guardrails: ["Scope guard", "Grounded-only prompt", "Abstain below threshold", "Doctor-in-the-loop"],
  ingestion: [
    { title: "NAMASTE + WHO ICD-11 corpora", body: "NAMC Ayurveda, NAMC Siddha, NUMC Unani, ICD-11 MMS / TM2." },
    { title: "Normalization", body: "Transliteration folding, diacritics, synonym graph." },
    { title: "Embedding", body: "all-MiniLM-L6-v2, 384-d, titles + long definitions." },
    { title: "Contrastive domain adaptation", body: "SapBERT / IndicBERT fine-tune, MNRL loss, expert-validated pairs.", feature: "rerank" as FeatureKey },
    { title: "Vector indexing", body: "Pinecone cosine ANN + ChromaDB, metadata-filtered." },
  ],
  schema: [
    "ICD11_Title",
    "ICD11_Code",
    "Ayurveda_NAMC_term / CODE",
    "Siddha_NAMC_TERM / CODE",
    "Unani_NUMC_TERM / CODE",
    "{system}_Similarity",
    "long definitions",
  ],
  ops: [
    { op: "$lookup", body: "Fetch a code's display, definition and properties." },
    { op: "$translate", body: "Map a code across ICD-11, NAMC and NUMC with confidence." },
    { op: "$expand", body: "Return the set of codes matching a search or filter." },
    { op: "$validate-code", body: "Confirm a code exists in its system before it's written." },
  ],
  stats: [
    { value: 36782, format: "number", prefix: "", suffix: "", label: "mappings indexed" },
    { value: 3, format: "number", prefix: "", suffix: "", label: "Ayush systems ↔ ICD-11" },
    { value: 95, format: "number", prefix: "≥ ", suffix: " %", label: "top-5 recall (target)" },
    { value: 300, format: "number", prefix: "< ", suffix: " ms", label: "p95 lookup" },
  ],
  callout: "MiniLM runs on CPU in milliseconds. Zero GPU. The LLM only explains — the codes come from the verified index.",
  hybridDemo: {
    query: "Agnimaandya",
    caption: "Illustrative retrieval behaviour.",
    modes: {
      keyword: { label: "Keyword only", result: "No results", detail: "BM25 needs the exact spelling. “Agnimaandya” ≠ “Agnimandya”.", hit: 0 },
      semantic: { label: "Semantic only", result: "Partial match", detail: "Embeddings find related digestive terms, but rank the exact concept lower.", hit: 1 },
      hybrid: { label: "Hybrid", result: "Agnimandya ↔ Dyspepsia (MG51)", detail: "Normalization + semantic + lexical, fused with RRF. The right concept ranks first.", hit: 2 },
    },
  },
};

/* ------------------------------------------------------------------ */
/* FHIR                                                                 */
/* ------------------------------------------------------------------ */
export const FHIR_COPY = {
  eyebrow: "Interoperability",
  title: "A diagnosis any system can read.",
  sub: "Every consultation becomes a validated HL7 FHIR R4 transaction Bundle — ready for any EMR, insurer or government system.",
  caption: "Codes elided in this preview.",
  stats: [
    { value: "100 %", label: "schema-valid bundles — every bundle is validated before publish" },
    { value: "6", label: "FHIR resource types per consultation" },
    { value: "4", label: "codings in one Condition" },
  ],
  destinations: ["Patient portal", "EMR/HIS", "NHCX claim-ready"],
};

export const FHIR_SHEETS: { id: string; title: string; body: string; items: string[] }[] = [
  { id: "Patient", title: "Patient", body: "Who the record belongs to.", items: ["ABHA (14-digit)", "Aadhaar (12-digit)", "Gmail", "Phone (10-digit)"] },
  { id: "Practitioner", title: "Practitioner", body: "The HPR-verified doctor.", items: ["HPR ID", "Registration number"] },
  { id: "Encounter", title: "Encounter", body: "The consultation visit itself.", items: ["Ambulatory class (AMB)", "Patient + practitioner references"] },
  { id: "Observation", title: "Observation", body: "The vitals captured at the desk.", items: ["Blood pressure", "Heart rate", "SpO₂", "Temperature", "Weight"] },
  { id: "MedicationRequest", title: "MedicationRequest", body: "The prescription.", items: ["Drug", "Dosage", "Frequency", "Duration", "Instructions"] },
  { id: "Condition", title: "Condition", body: "One diagnosis. Four codings.", items: ["ICD-11", "Ayurveda NAMC", "Siddha NAMC", "Unani NUMC"] },
];

export const FHIR_JSON = `{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    { "resource": { "resourceType": "Patient",
        "identifier": [{ "system": "https://abha.gov.in", "value": "XX-XXXX-XXXX-XXXX" }] } },
    { "resource": { "resourceType": "Practitioner",
        "identifier": [{ "value": "HPR-XXXXXXXX" }] } },
    { "resource": { "resourceType": "Encounter",
        "class": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB" } } },
    { "resource": { "resourceType": "Observation",
        "code": { "text": "Heart Rate" }, "valueQuantity": { "value": 72, "unit": "bpm" } } },
    { "resource": { "resourceType": "Condition", "code": { "coding": [
        { "system": "http://id.who.int/icd/release/11",    "code": "XXXX", "display": "Gastroenteritis" },
        { "system": "http://ayush.gov.in/namc/ayurveda",  "code": "XXXX", "display": "Grahani" },
        { "system": "http://ayush.gov.in/namc/siddha",    "code": "XXXX", "display": "Kirani" },
        { "system": "http://ayush.gov.in/numc/unani",     "code": "XXXX", "display": "Ishaal" } ] } } },
    { "resource": { "resourceType": "MedicationRequest", "…": "…" } }
  ]
}`;

/* ------------------------------------------------------------------ */
/* Grounded AI                                                          */
/* ------------------------------------------------------------------ */
export const AI_COPY = {
  eyebrow: "Grounded clinical AI",
  title: "It answers from the index. Or it doesn't answer.",
  sub: "The MedLink assistant uses Gemini 2.5 Flash — but only to explain what the verified index returned. It abstains when unsure and never invents a code.",
  suggestions: [
    "Translate Cholera to Ayurveda",
    "What is ICD-11 code 1A00?",
    "Compare Ayurveda, Siddha & Unani terms for Migraine",
    "What is MedLink?",
  ],
  history: ["Translate Gastroenteritis", "ICD-11 code 1A00", "Migraine across systems"],
  inputPlaceholder: "Ask about disease codes, translations…",
  footer: "MedLink AI · 36,782 codes",
  refusal: "I'm MedLink AI, a medical coding assistant. I can only help with disease codes, ICD-11/AYUSH translations, and MedLink platform queries.",
  abstain: "I can't find a confident match in the verified index — flagged for doctor review.",
  script: [
    { user: "Translate Gastroenteritis", kind: "table" as const },
    { user: "What's a good recipe for biryani?", kind: "refusal" as const },
    { user: "Find the code for “tired after the long train journey”", kind: "abstain" as const },
  ],
  table: [
    { system: "Ayurveda" as const, key: "ayurveda" as SystemKey, term: "Grahani", confidence: 92 },
    { system: "Siddha" as const, key: "siddha" as SystemKey, term: "Kirani", confidence: 88 },
    { system: "Unani" as const, key: "unani" as SystemKey, term: "Ishaal", confidence: 90 },
    { system: "ICD-11" as const, key: "icd" as SystemKey, term: "Gastroenteritis", confidence: 100 },
  ],
  modes: [
    { id: "code", label: "Code only" },
    { id: "concise", label: "Concise" },
    { id: "default", label: "Default" },
    { id: "detailed", label: "Detailed" },
    { id: "full", label: "Full detail" },
  ] as const,
  modeText: {
    code: [] as string[],
    concise: ["Gastroenteritis maps to Grahani (Ayurveda), Kirani (Siddha) and Ishaal (Unani). All three are high-confidence matches from the verified index."],
    default: [
      "Gastroenteritis maps to Grahani (Ayurveda), Kirani (Siddha) and Ishaal (Unani). Each term was retrieved from the verified index with its own confidence score.",
      "Clinical note: the doctor confirms the mapping before it is written to the FHIR Condition.",
    ],
    detailed: [
      "Gastroenteritis maps to Grahani (Ayurveda), Kirani (Siddha) and Ishaal (Unani). Each term was retrieved from the verified index with its own confidence score.",
      "All three systems describe a disorder of digestion with altered bowel function; the semantic match is driven by the long definitions, not the spelling.",
      "Clinical note: the doctor confirms the mapping before it is written to the FHIR Condition.",
    ],
    full: [
      "Gastroenteritis maps to Grahani (Ayurveda), Kirani (Siddha) and Ishaal (Unani). Each term was retrieved from the verified index with its own confidence score.",
      "Cross-system comparison: the three traditional terms sit closest to each other in embedding space, and closest to the ICD-11 concept through their long definitions.",
      "Confidence analysis: Ayurveda scores highest; Siddha is slightly lower and still well above the review threshold. Nothing here was forced.",
      "Historical context: these terms come from the NAMASTE vocabularies, which standardise Ayush morbidity terms for national reporting.",
      "Clinical note: the doctor confirms the mapping before it is written to the FHIR Condition.",
    ],
  } as Record<string, string[]>,
  trust: [
    { title: "Vector index = single source of truth", body: "Codes are retrieved, never generated." },
    { title: "Temperature 0", body: "Deterministic answers. No creative guessing." },
    { title: "Scope guard", body: "Off-topic questions are refused in-voice." },
    { title: "Abstain below threshold", body: "Low confidence becomes a doctor review flag." },
  ],
  hood: ["Query", "Retrieve", "Ground", "Generate", "Verify"],
  caption: "Scripted demo · Interface preview with sample data.",
};

/* ------------------------------------------------------------------ */
/* Doctor portal                                                        */
/* ------------------------------------------------------------------ */
export const DOCTOR_COPY = {
  eyebrow: "For doctors",
  title: "The consultation desk, rebuilt around the diagnosis.",
  sub: "Everything from patient registration to a published FHIR record in one flow.",
};

export const DOCTOR_TABS = [
  { id: "dashboard", label: "Dashboard", feature: "Stat tiles, OTP patient linking and recent patients." },
  { id: "patients", label: "Patients", feature: "A searchable patient list with ABHA badges." },
  { id: "consultation", label: "Consultation", feature: "Patient → Vitals → History → Diagnosis → Prescription, validated live." },
  { id: "translation", label: "Code Translation", feature: "Search by name or code. Pick multiple diagnoses." },
  { id: "appointments", label: "Appointments", feature: "Filter, accept or decline, export CSV." },
  { id: "fhir", label: "FHIR Records", feature: "Generate, preview, copy and publish bundles." },
  { id: "settings", label: "Clinic Settings", feature: "Clinic name, address, specialisations, hours." },
  { id: "profile", label: "Profile", feature: "HPR-verified identity and experience." },
] as const;

export type DoctorTab = (typeof DOCTOR_TABS)[number]["id"];

export const SAMPLE_PATIENTS = [
  { name: "Priya Sharma", abha: "91-••••-••••-2041", dx: "Gastroenteritis", status: "FHIR Published" },
  { name: "Arjun Mehta", abha: "91-••••-••••-7713", dx: "Migraine", status: "Draft" },
  { name: "Fatima Khan", abha: "91-••••-••••-5520", dx: "Dyspepsia", status: "FHIR Published" },
  { name: "Ravi Iyer", abha: "91-••••-••••-3398", dx: "Cholera", status: "Pending" },
];

export const SAMPLE_APPOINTMENTS = [
  { name: "Priya Sharma", time: "10:30", dx: "Gastroenteritis", code: "••••", status: "pending" },
  { name: "Arjun Mehta", time: "11:15", dx: "Migraine", code: "••••", status: "accepted" },
  { name: "Fatima Khan", time: "12:00", dx: "Dyspepsia", code: "MG51", status: "pending" },
  { name: "Ravi Iyer", time: "14:45", dx: "Cholera", code: "1A00", status: "declined" },
];

/* ------------------------------------------------------------------ */
/* Patient portal                                                       */
/* ------------------------------------------------------------------ */
export const PATIENT_COPY = {
  eyebrow: "For patients",
  title: "Your records. Your language. Your control.",
  sub: "Every visit becomes a record you own — in a standard any hospital can read.",
};

export const PATIENT_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "records", label: "My Records" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "doctors", label: "Find Doctors" },
  { id: "appointments", label: "Appointments" },
  { id: "documents", label: "Documents" },
  { id: "profile", label: "Profile" },
] as const;

export type PatientTab = (typeof PATIENT_TABS)[number]["id"];

export const PRESCRIPTION_LANGS = [
  { id: "en", label: "English", lang: "en", text: "Paracetamol 500 mg — twice a day after meals — 5 days" },
  { id: "hi", label: "हिंदी", lang: "hi", text: "पैरासिटामोल 500 मि.ग्रा. — दिन में दो बार, भोजन के बाद — 5 दिन" },
  { id: "ta", label: "தமிழ்", lang: "ta", text: "பாராசிட்டமால் 500 மி.கி — தினமும் இரண்டு முறை, உணவுக்குப் பிறகு — 5 நாட்கள்" },
  { id: "gu", label: "ગુજરાતી", lang: "gu", text: "પેરાસિટામોલ 500 મિ.ગ્રા. — દિવસમાં બે વાર, જમ્યા પછી — 5 દિવસ" },
];

export const SPECIALTIES = ["General Medicine", "Cardiology", "Ayurveda", "Pediatrics", "Dermatology", "Siddha", "Unani"];

export const SAMPLE_DOCTORS = [
  { name: "Dr. Ananya Rao", specialty: "Ayurveda", clinic: "Sushruta Wellness Clinic", km: 1.2, rating: 4.8, slot: "Today, 5:30 PM", available: true, x: 46, y: 42 },
  { name: "Dr. Imran Qureshi", specialty: "Unani", clinic: "Hikmat Unani Centre", km: 2.6, rating: 4.6, slot: "Tomorrow, 10:00 AM", available: true, x: 62, y: 30 },
  { name: "Dr. Meenakshi Sundaram", specialty: "Siddha", clinic: "Agathiyar Siddha Clinic", km: 3.9, rating: 4.7, slot: "Tomorrow, 4:00 PM", available: false, x: 30, y: 64 },
  { name: "Dr. Vikram Singh", specialty: "General Medicine", clinic: "City Care Hospital", km: 0.8, rating: 4.5, slot: "Today, 6:15 PM", available: true, x: 54, y: 56 },
  { name: "Dr. Kavya Nair", specialty: "Cardiology", clinic: "Heartline Institute", km: 6.4, rating: 4.9, slot: "Fri, 11:30 AM", available: true, x: 76, y: 70 },
  { name: "Dr. Rohan Das", specialty: "Pediatrics", clinic: "Little Steps Clinic", km: 4.8, rating: 4.7, slot: "Thu, 9:00 AM", available: true, x: 22, y: 28 },
  { name: "Dr. Sana Mirza", specialty: "Dermatology", clinic: "SkinFirst Clinic", km: 8.2, rating: 4.4, slot: "Sat, 12:00 PM", available: false, x: 84, y: 40 },
];

export const SAMPLE_DOCUMENTS = [
  { name: "Blood Test Report", type: "PDF", size: "1.2 MB" },
  { name: "Chest X-Ray", type: "PNG", size: "3.4 MB" },
  { name: "ECG Report", type: "JPG", size: "860 KB" },
];

/* ------------------------------------------------------------------ */
/* National stack                                                       */
/* ------------------------------------------------------------------ */
export const NATIONAL = {
  title: "Built on the rails India already built.",
  sub: "MedLink doesn't invent a standard. It speaks the ones the country mandates.",
  note: "Aligned with DISHA and DPDP.",
  rails: [
    { name: "ABHA", role: "Patient identity & OTP login.", feature: "abdmLive" as FeatureKey, icon: "IdCard" },
    { name: "HPR", role: "Doctor verification.", feature: "abdmLive" as FeatureKey, icon: "BadgeCheck" },
    { name: "ABDM consent & exchange", role: "Consent artefacts and the HIP role.", feature: "abdmLive" as FeatureKey, icon: "Network" },
    { name: "HFR", role: "Health facility registry.", feature: "abdmLive" as FeatureKey, icon: "Building2" },
    { name: "NHCX", role: "Claim-ready ICD-11 output.", feature: "nhcx" as FeatureKey, icon: "Receipt" },
    { name: "WHO ICD-11 / TM2", role: "The global reference.", feature: "translation" as FeatureKey, icon: "Globe" },
    { name: "HL7 FHIR R4 + SMART-on-FHIR", role: "Interoperable data and secure app access.", feature: "fhirBundle" as FeatureKey, icon: "FileJson" },
    { name: "EHR Standards 2016", role: "Alignment with India's EHR standards.", feature: "fhirBundle" as FeatureKey, icon: "Landmark" },
  ],
};

/* ------------------------------------------------------------------ */
/* Trust                                                                */
/* ------------------------------------------------------------------ */
export const TRUST = {
  eyebrow: "Trust",
  title: "Designed so that trust is structural.",
  sub: "Consent first. Encrypted always. Auditable end to end. And a human always signs off.",
  strip: ["OAuth2 + JWT", "Rate limiting + WAF", "OpenTelemetry", "Aligned with DISHA & DPDP"],
  cards: {
    consent: { title: "Consent-first access", body: "ABHA OTP and ABDM consent artefacts decide who sees what.", feature: "abdmLive" as FeatureKey },
    encryption: { title: "Encryption", body: "AES-256 at rest. TLS 1.3 in transit. Signed, time-limited URLs." },
    rls: { title: "Row-Level Security", body: "Each patient sees only their own rows — Supabase Postgres RLS.", feature: "rls" as FeatureKey },
    audit: { title: "Hash-chained audit trail", body: "Every action links to the previous by hash. Tampering breaks the chain. Click a block to try.", feature: "auditLedger" as FeatureKey },
    human: { title: "Human-in-the-loop", body: "A doctor verifies every OCR-digitised legacy record before it is saved.", feature: "ocr" as FeatureKey },
    deid: { title: "De-identified analytics", body: "k-anonymity before anything reaches Ayush dashboards.", feature: "analytics" as FeatureKey },
  },
};

/* ------------------------------------------------------------------ */
/* Built for Bharat                                                     */
/* ------------------------------------------------------------------ */
export const BHARAT = {
  title: "Built for the clinic at the end of the road.",
  sub: "Multilingual, offline-first and light enough to run anywhere.",
  tiles: [
    { id: "voice", title: "11 languages for voice dictation", body: "Speak the consultation in the language you practise in.", feature: "voice" as FeatureKey },
    { id: "offline", title: "Offline-first PWA", body: "Keep working when the network doesn't. Sync when it returns.", feature: "pwa" as FeatureKey },
    { id: "cpu", title: "Zero-GPU, CPU-light AI", body: "MiniLM runs in milliseconds on a CPU. The LLM only explains." },
    { id: "open", title: "Open, vendor-neutral, deployable anywhere", body: "Containerised with Docker — on-prem or government cloud." },
    { id: "scale", title: "Scales to a billion records", body: "Stateless services, ANN indexing and caching scale horizontally." },
  ],
  greetings: [
    { text: "नमस्ते", lang: "hi" },
    { text: "வணக்கம்", lang: "ta" },
    { text: "નમસ્તે", lang: "gu" },
    { text: "স্বাগতম", lang: "bn" },
    { text: "నమస్కారం", lang: "te" },
    { text: "ನಮಸ್ಕಾರ", lang: "kn" },
  ],
};

/* ------------------------------------------------------------------ */
/* Architecture                                                         */
/* ------------------------------------------------------------------ */
export const ARCH = {
  eyebrow: "Under the hood",
  title: "Six layers. One fabric.",
  sub: "Stateless microservices, a verified knowledge store, and the national health stack — wrapped in security and observability.",
  layers: [
    {
      name: "Clients",
      note: "React 18 · TypeScript · Vite · Tailwind · shadcn/ui",
      items: [
        { label: "Patient Portal", status: "live" as Status },
        { label: "Doctor Console", status: "live" as Status },
        { label: "Offline-first PWA", status: "roadmap" as Status },
        { label: "Hospital EMR/HIS (via FHIR)", status: "live" as Status },
      ],
    },
    {
      name: "Edge & API",
      note: "",
      items: [
        { label: "Vercel Edge CDN", status: "live" as Status },
        { label: "API Gateway", status: "live" as Status },
        { label: "SMART-on-FHIR OAuth2 + JWT", status: "roadmap" as Status },
        { label: "Rate limit + WAF", status: "roadmap" as Status },
      ],
    },
    {
      name: "Core microservices (FastAPI)",
      note: "",
      items: [
        { label: "SETU Terminology · $lookup · $translate · $expand · $validate-code", status: "live" as Status },
        { label: "RAG Assistant · /doctor_chat · /landing_chat", status: "live" as Status },
        { label: "FHIR Bundle · build · validate · sign", status: "live" as Status },
        { label: "OCR + Verify", status: "roadmap" as Status },
        { label: "Translation · Bhashini / IndicTrans2", status: "roadmap" as Status },
        { label: "Analytics · de-identified, k-anonymity", status: "roadmap" as Status },
        { label: "Notification · SMS / WhatsApp", status: "roadmap" as Status },
      ],
    },
    {
      name: "Intelligence layer",
      note: "",
      items: [
        { label: "MiniLM-L6-v2 embedder", status: "live" as Status },
        { label: "Pinecone vector index", status: "live" as Status },
        { label: "ChromaDB knowledge store", status: "live" as Status },
        { label: "Cross-encoder re-ranker", status: "roadmap" as Status },
        { label: "Gemini 2.5 Flash (grounded)", status: "live" as Status },
      ],
    },
    {
      name: "Data layer",
      note: "",
      items: [
        { label: "Supabase Postgres + RLS", status: "live" as Status },
        { label: "Encrypted object storage (signed, time-limited URLs)", status: "live" as Status },
        { label: "Redis cache", status: "roadmap" as Status },
        { label: "Hash-chained audit ledger", status: "roadmap" as Status },
      ],
    },
    {
      name: "National Health Stack",
      note: "",
      items: [
        { label: "ABDM Gateway (ABHA)", status: "roadmap" as Status },
        { label: "HPR", status: "roadmap" as Status },
        { label: "HFR", status: "roadmap" as Status },
        { label: "NHCX", status: "roadmap" as Status },
        { label: "WHO ICD API", status: "roadmap" as Status },
      ],
    },
  ],
  rails: [
    { name: "Security", items: ["AES-256", "TLS 1.3", "RLS", "DISHA/DPDP aligned"] },
    { name: "Observability", items: ["OpenTelemetry", "Prometheus", "Grafana"] },
  ],
  stack: [
    { group: "Frontend", items: ["React 18 + TypeScript", "Vite", "Tailwind", "shadcn/ui", "TanStack Query", "Framer Motion"] },
    { group: "Backend", items: ["FastAPI (Python)", "LangChain"] },
    { group: "AI/ML", items: ["Gemini 2.5 Flash (grounded RAG)", "Sentence-Transformers (MiniLM-L6-v2)"] },
    { group: "Data", items: ["Pinecone (vector ANN)", "ChromaDB", "Supabase (Postgres + RLS)"] },
    { group: "Interop", items: ["HL7 FHIR R4", "ABDM · ABHA · HPR", "NHCX"] },
    { group: "DevOps/QA", items: ["Docker", "Vercel", "Playwright", "Vitest"] },
  ],
};

/* ------------------------------------------------------------------ */
/* Impact                                                               */
/* ------------------------------------------------------------------ */
export const IMPACT = {
  title: "Five ways it changes care.",
  cards: [
    { area: "Clinical", pull: "Seconds, not minutes.", body: "One diagnosis, four vocabularies, one search. Fewer coding errors. Faster consultations." },
    { area: "Economic", pull: "Claim-ready by default.", body: "ICD-11-coded Ayush claims become NHCX-ready. Less manual coding. Faster reimbursement." },
    { area: "Public health & policy", pull: "Data for the Ministry of Ayush.", body: "The first national-scale Ayush morbidity data lake: which conditions, in which system, in which state." },
    { area: "Interoperability", pull: "Ayush ↔ Allopathy continuity.", body: "Any FHIR R4 EMR can read an Ayurveda, Siddha or Unani diagnosis. Records follow the patient across systems." },
    { area: "Patient empowerment & inclusion", pull: "Aligned with Digital India.", body: "Own your records, get prescriptions in Hindi and Tamil, find doctors nearby, work offline in rural clinics." },
  ],
  flywheel: ["Consultation", "Coded FHIR record", "De-identified analytics", "Ministry insights", "Better terminologies & policy"],
};

/* ------------------------------------------------------------------ */
/* Feasibility                                                          */
/* ------------------------------------------------------------------ */
export const FEASIBILITY = {
  title: "Hard problems. Real answers.",
  feasible: [
    { title: "Built on mandated national rails", body: "ABDM, ABHA, HPR, FHIR R4, ICD-11, EHR Standards 2016 — no new standard to invent." },
    { title: "Working prototype today", body: "36,782 mappings loaded, hybrid search, FHIR bundle generation and two RAG assistants running." },
    { title: "Light compute, zero GPU", body: "MiniLM embeddings run on CPU in milliseconds." },
    { title: "Open & vendor-neutral", body: "Standards in, standards out. Containerised and deployable anywhere." },
    { title: "Scales to a billion records", body: "Stateless services, ANN indexing and caching scale horizontally." },
  ],
  challenges: [
    { problem: "No 1:1 equivalence between traditional and biomedical concepts", solution: "Semantic matching on long definitions, per-system confidence scores, multi-coding in FHIR and doctor confirmation. No forced mappings." },
    { problem: "LLMs hallucinate medical codes", solution: "Grounded RAG with the vector index as the single source of truth. Temperature 0, abstain below threshold, scope guard. Every code traceable to a source row." },
    { problem: "Spelling & transliteration variance (Agnimandya / Agnimaandya)", solution: "Hybrid fuzzy + phonetic + embedding retrieval, a synonym graph and diacritic normalisation." },
    { problem: "Patient privacy & consent", solution: "ABHA OTP, ABDM consent artefacts, Row-Level Security, AES-256, signed time-limited URLs, a hash-chained audit log and de-identified analytics." },
    { problem: "Legacy paper records, rural connectivity, EMR diversity", solution: "OCR with mandatory doctor verification, an offline-first PWA with sync, FHIR R4 profiles and SMART-on-FHIR APIs." },
  ],
  badges: ["FHIR R4", "ABDM Ready", "DISHA / DPDP Aligned", "Offline-First"],
};

/* ------------------------------------------------------------------ */
/* Metrics                                                              */
/* ------------------------------------------------------------------ */
export const METRICS = [
  { value: 36782, prefix: "", suffix: "", ring: 1, caption: "ICD-11 ↔ Ayush mappings across 3 traditional systems." },
  { value: 95, prefix: "≥ ", suffix: " %", ring: 0.95, caption: "Top-5 recall on expert-validated mappings.", tag: "Target" },
  { value: 300, prefix: "< ", suffix: " ms", ring: 0.3, caption: "p95 code lookup. Search debounce 250 ms. RAG answer < 2 s." },
  { value: 100, prefix: "", suffix: " %", ring: 1, caption: "FHIR R4 schema-valid bundles. 6 resource types. 4 codings per Condition." },
  { value: 0, prefix: "", suffix: "", ring: 0, caption: "Ungrounded codes. Every code traceable to a source row. 100 % audit coverage on the roadmap." },
];

/* ------------------------------------------------------------------ */
/* Research & team                                                      */
/* ------------------------------------------------------------------ */
export const REFERENCES = [
  { title: "NAMASTE Portal (AYUSH)", took: "Ayush terminology and ICD dual-coding.", url: "https://namstp.ayush.gov.in" },
  { title: "NAMASTE–ICD-11 APIs", took: "FHIR search, mapping and dual-coded bundles." },
  { title: "ICTIS 2026", took: "NAMASTE ↔ ICD-11 mapping using TF-IDF + Linear SVM." },
  { title: "STM Journals (2026)", took: "A REST/FHIR terminology service with hybrid mapping." },
  { title: "IJIRT", took: "A FHIR R4 microservice for NAMASTE ↔ ICD mapping." },
  { title: "WHO ICD-11 TM2 + HL7 FHIR R4", took: "Standards for terminology and interoperability." },
  { title: "RAG + Sentence-BERT", took: "The basis for retrieval-grounded semantic mapping (Lewis et al., 2020; Reimers & Gurevych, 2019)." },
  { title: "Indian Patent Law, Section 3(k)", took: "CRI Guidelines and technical-effect precedent." },
];

export const TEAM = {
  university: "Manipal University Jaipur",
  department: "Department of Computer Science & Engineering (AI/ML)",
  program: "PBL 2026–27",
  guide: "Dr. Rahul Sharma",
  members: [
    { name: "Hemank Kumar", id: "2427010063", initials: "HK" },
    { name: "Lakshya Kapoor", id: "2427010414", initials: "LK" },
    { name: "Neeraj", id: "2427010033", initials: "N" },
  ],
};

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */
export const FAQ: { q: string; a: string; keywords: string[] }[] = [
  {
    q: "What is NAMASTE and what is ICD-11?",
    a: "NAMASTE (National AYUSH Morbidity & Standardized Terminologies Electronic) is India's national vocabulary for Ayush diagnoses — NAMC codes for Ayurveda and Siddha, NUMC codes for Unani. ICD-11 is the WHO's International Classification of Diseases, 11th revision, used by hospitals, insurers and researchers worldwide. Its TM2 module covers traditional medicine.",
    keywords: ["namaste", "icd", "icd-11", "namc", "numc", "tm2", "vocabulary"],
  },
  {
    q: "Does MedLink replace a doctor's judgment?",
    a: "No. MedLink suggests; the doctor confirms every mapping. Low-confidence results are flagged for review.",
    keywords: ["replace", "doctor", "judgment", "judgement", "decide"],
  },
  {
    q: "What if there is no exact equivalent?",
    a: "MedLink never forces a 1:1 match. It shows confidence per system and routes low confidence to the doctor.",
    keywords: ["equivalent", "exact", "1:1", "match", "no match"],
  },
  {
    q: "How accurate are the mappings?",
    a: "The target is ≥ 95 % top-5 recall against expert-validated mappings. Confidence is shown per system so the doctor can judge every result.",
    keywords: ["accurate", "accuracy", "recall", "precision", "confidence"],
  },
  {
    q: "Can the AI invent a code?",
    a: "No. Codes come only from the verified index. The model only explains what was retrieved, runs at temperature 0, and abstains below a confidence threshold.",
    keywords: ["ai", "invent", "hallucinate", "hallucination", "gemini", "llm", "rag"],
  },
  {
    q: "Is patient data safe?",
    a: "Safety is structural. Live in the prototype: role-based sign-in, Row-Level Security so each patient sees only their own rows, and encrypted storage with signed, time-limited URLs. On the roadmap: live ABHA OTP with ABDM consent artefacts, a hash-chained audit ledger and de-identified k-anonymity analytics. Encryption is AES-256 at rest and TLS 1.3 in transit. MedLink is designed to align with DISHA and DPDP.",
    keywords: ["safe", "privacy", "secure", "security", "data", "consent", "encryption"],
  },
  {
    q: "Does it work offline or in regional languages?",
    a: "Prescriptions are available in Hindi, Tamil, Gujarati and more today. An offline-first PWA and voice dictation in 11 Indian languages are on the roadmap.",
    keywords: ["offline", "language", "hindi", "tamil", "gujarati", "regional", "rural"],
  },
  {
    q: "Can my hospital's EMR use the output?",
    a: "Yes. MedLink produces standards-based HL7 FHIR R4 Bundles that any FHIR-capable EMR can read. SMART-on-FHIR app access is on the roadmap.",
    keywords: ["emr", "hospital", "his", "fhir", "integrate", "integration"],
  },
  {
    q: "Which systems are covered?",
    a: "Ayurveda, Siddha and Unani, mapped to WHO ICD-11 — 36,782 mappings in total.",
    keywords: ["systems", "covered", "ayurveda", "siddha", "unani", "mappings", "36,782"],
  },
  {
    q: "Is this production-ready?",
    a: "MedLink is a university prototype (PBL 2026–27). It runs on sample data, is not a certified medical device, and is not for clinical use yet.",
    keywords: ["production", "ready", "certified", "clinical", "prototype", "use"],
  },
];

export const ASSISTANT_KB: { q: string; a: string; keywords: string[] }[] = [
  {
    q: "What is MedLink?",
    a: "MedLink is a FHIR-native dual-coding platform. A doctor types a diagnosis and MedLink shows the equivalent terms in Ayurveda, Siddha, Unani and WHO ICD-11, each with a confidence score. The consultation becomes a validated HL7 FHIR R4 Bundle any EMR, insurer or government system can read.",
    keywords: ["medlink", "what is", "about", "platform", "project"],
  },
  {
    q: "How does the dual-coding work?",
    a: "The SETU engine embeds the query (MiniLM, 384-d), searches a Pinecone vector index and a BM25 keyword index side by side, fuses the rankings, and returns the closest Ayurveda, Siddha, Unani and ICD-11 terms with per-system confidence. The doctor confirms, and all four codings are written into one FHIR Condition.",
    keywords: ["dual", "coding", "work", "how", "setu", "engine", "search", "map"],
  },
  ...FAQ,
  ...Object.values(GLOSSARY).map((g) => ({ q: `What is ${g.term}?`, a: `${g.term}: ${g.meaning}`, keywords: [g.term.toLowerCase()] })),
];

export const ASSISTANT_COPY = {
  title: "Ask MedLink",
  starters: ["What is MedLink?", "What is NAMASTE?", "How does the dual-coding work?", "Is my data safe?"],
  offline: "Offline answers",
  disclaimer: "General information about MedLink — not medical advice.",
  fallback: "I don't have an answer for that here. Try asking about NAMASTE, ICD-11, FHIR, the SETU engine, or data safety — or open the app to explore.",
};

/* ------------------------------------------------------------------ */
/* Onboarding & tour                                                    */
/* ------------------------------------------------------------------ */
export const GREETINGS = [
  { text: "Welcome", lang: "en" },
  { text: "नमस्ते", lang: "hi" },
  { text: "வணக்கம்", lang: "ta" },
  { text: "નમસ્તે", lang: "gu" },
  { text: "স্বাগতম", lang: "bn" },
  { text: "నమస్కారం", lang: "te" },
  { text: "ನಮಸ್ಕಾರ", lang: "kn" },
];

export const TOUR_STOPS = [
  { target: "demo", caption: "Type a diagnosis. See four vocabularies." },
  { target: "pipeline", caption: "Seven steps from first word to FHIR record." },
  { target: "fhir", caption: "One consultation. Six resources. Four codings." },
  { target: "ai", caption: "An assistant that can't make things up." },
  { target: "portals", caption: "Built for doctors. Owned by patients." },
];

/* ------------------------------------------------------------------ */
/* Final CTA & footer                                                   */
/* ------------------------------------------------------------------ */
export const FINAL_CTA = {
  title: "Make every diagnosis speak every language.",
  sub: "Open MedLink and run your first translation in seconds.",
  paths: [
    { title: "I'm a doctor", body: "Open the Consultation Desk" },
    { title: "I'm a patient", body: "Open my health record" },
  ],
};

export const FOOTER = {
  explore: [
    { label: "Problem", href: "#problem" },
    { label: "How it works", href: "#how" },
    { label: "Engine", href: "#engine" },
    { label: "FHIR", href: "#fhir" },
    { label: "AI", href: "#ai" },
    { label: "Portals", href: "#doctors" },
  ],
  platform: [
    { label: "Doctor console", href: "#doctors" },
    { label: "Patient portal", href: "#patients" },
    { label: "Architecture", href: "#architecture" },
    { label: "Impact", href: "#impact" },
  ],
  standards: ["ABDM", "ABHA", "HPR", "HL7 FHIR R4", "ICD-11", "NAMASTE"],
  copyright: "© 2026 MedLink · PBL 2026–27 · Manipal University Jaipur · Department of CSE (AI/ML)",
  notice: "MedLink is a university prototype built with sample data. It is not a certified medical device and is not intended for clinical use.",
};

export const STORAGE_KEYS = {
  onboarded: "medlink:onboarded",
  persona: "medlink:persona",
  theme: "medlink:theme",
  reduceMotion: "medlink:reduce-motion",
  smooth: "medlink:smooth",
};
