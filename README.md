# MedLink &bull; AYUSH & Allopathic Clinical Interoperability Platform

MedLink bridges modern healthcare standards (WHO ICD-11, HL7 FHIR R4, ABDM) with India's traditional medical systems (Ayurveda, Siddha, and Unani — AYUSH). It provides consent-first clinical records, dual-coded diagnosis translation across 36,757 terms, zero-browser-secret AI clinical intelligence, bilingual prescriptions, and a tamper-evident SHA-256 chained audit log.

---

## Key Capabilities

1. **Dual-Coded Diagnoses (ICD-11 &bull; AYUSH):**
   - 36,757 national terminology mappings loaded into PostgreSQL with `pg_trgm` and `tsvector` full-text search.
   - Cross-system confidence scoring across Ayurveda (NAMASTE), Siddha (NAMASTE), and Unani (NUMC).
   - Doctor-confirmed traditional codes (Constraint C4): traditional mappings are never auto-forced.

2. **HL7 FHIR R4 Bundle Compilation:**
   - Full transaction bundle generation containing `Patient`, `Practitioner`, `Encounter`, `Observation` (LOINC), `Condition` (dual ICD-11 & AYUSH codings), and `MedicationRequest`.
   - In-app JSON viewer and validation inspector.

3. **Grounded AI Clinical Assistant:**
   - Streaming Server-Sent Events (SSE) AI assistant running via Supabase Edge Function (`ai-chat`).
   - Grounded RAG with server-side database lookup against `disease_mappings`.
   - **Zero client secrets:** All AI calls executed in Edge Functions with no API keys exposed to the browser.

4. **Consent-First Patient Architecture:**
   - Patient consent verified via ABDM OTP challenge flow before doctor record access.
   - Patient Consent Manager allows instant one-click revocation of doctor permissions.

5. **Tamper-Evident SHA-256 Audit Chain:**
   - Every patient read, write, and link event is recorded in a cryptographically chained audit log (`BEFORE INSERT` trigger).
   - Client-side verifier (`verifyAuditChain`) ensures no row modifications or deletions have occurred.

6. **Indic Prescription Translation & PDF Export:**
   - Translations into Hindi, Tamil, and Telugu via Edge Function (`translate-prescription`) with medical fallback dictionary.
   - Formatted bilingual PDF prescriptions generated via `jspdf`.

---

## Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query v5 |
| **Data Visualization** | Recharts (LOINC vitals line charts), QRCode |
| **Backend & Database** | PostgreSQL 15, Supabase (GoTrue Auth, PostgREST, Realtime, Storage) |
| **Extensions** | `pgcrypto`, `pg_trgm`, `unaccent` |
| **Edge Compute** | Supabase Edge Functions (Deno runtime, TypeScript) |
| **Testing** | Vitest (25 tests covering auth, FHIR generation, audit chain, slots) |

---

## Local Development & Setup

### 1. Prerequisites
- Node.js 18+ & npm
- Docker (for local Supabase stack)
- Supabase CLI (`npx supabase`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Supabase Stack
```bash
npx supabase start
```
This spins up:
- API Gateway / Kong: `http://127.0.0.1:54321`
- PostgreSQL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Supabase Studio: `http://127.0.0.1:54323`
- Mailpit / Inbucket: `http://127.0.0.1:54324`

### 4. Serve Edge Functions
```bash
npx supabase functions serve --env-file supabase/functions/.env
```

### 5. Seed Database
```bash
npm run seed
```
This script loads:
- All 36,757 disease mappings from `public/conciseFinalData.csv`
- 6 doctors with HPR IDs, clinics, coordinates, and schedules
- 4 patients with ABHA identifiers
- Active doctor-patient links, appointments, consultations with FHIR bundles, documents, and audit logs.

### 6. Start Vite Frontend
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## Testing & Verification

Run the test suite:
```bash
npm test
```

Run linter and build:
```bash
npm run lint
npm run build
```

Verify landing page freezing invariant (Constraint C1):
```bash
git diff --stat -- src/components/landing src/pages/LandingPage.tsx src/lib/landing-data.ts
```
*(Output must remain empty).*

---

## Demo Walkthrough
See [DEMO.md](file:///home/neeraj/Desktop/Coding/MedLink%20PBL/DEMO.md) for the complete 6-minute walkthrough script and test credentials.
See [DECISIONS.md](file:///home/neeraj/Desktop/Coding/MedLink%20PBL/DECISIONS.md) for architectural trade-off records.
