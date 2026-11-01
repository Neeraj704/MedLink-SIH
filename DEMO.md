# MedLink PBL Mentor Live Walkthrough Script (6 Minutes)

This script provides a 6-minute demonstration path covering all MedLink platform capabilities for the PBL mentor review.

---

## Demo Credentials & Setup

| Role | Name | Test Identifier | Demo OTP | Target URL |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor** | Dr. Ananya Rao | `HPR-1234-5678` | `587315` | `http://localhost:5173/signin?role=doctor` |
| **Patient** | Priya Sharma | `91-8842-1920-3341` | `587315` | `http://localhost:5173/signin?role=patient` |

> [!NOTE]
> Ensure the Supabase local environment is running:
> ```bash
> npx supabase start
> npx supabase functions serve --env-file supabase/functions/.env
> npm run dev
> ```

---

## 6-Minute Demonstration Sequence

### Minute 0:00 - 1:00 &bull; Landing Page & Autonomous Sign-In
1. Navigate to `http://localhost:5173/`.
2. Point out the frozen design invariants: dual-coding architecture, ABDM compatibility, consent-first records, and prototype disclaimer.
3. Click **Sign In** &rarr; select **Doctor**.
4. Enter identifier: `HPR-1234-5678` &rarr; click **Send one-time code**.
5. Enter demo code `587315` (or click **Demo OTP 587315 Autofill**).
6. Verify smooth verification transition and redirection to `/doctor`.

---

### Minute 1:00 - 2:30 &bull; Doctor Dashboard & Consent-First Linking
1. **Stats Overview:** Note live statistics (Patients Today, Pending Drafts, Consultation Speed, FHIR Compliance).
2. **Consent-First Linking Modal:**
   - Click **Link New Patient**.
   - Select **ABHA Number** &rarr; enter `91-8842-1920-3341` (Priya Sharma).
   - Click **Send Consent OTP** &rarr; enter OTP `587315`.
   - Show that consent is verified, an audit event is logged, and Priya Sharma appears in the consented list.
3. Click **Consult** on Priya Sharma's row &rarr; transitions directly to `/doctor/consultation?patient=...`.

---

### Minute 2:30 - 4:00 &bull; Dual AYUSH-ICD11 Consultation Desk
1. Notice that patient details (ABHA, Name, Demographics) are auto-populated from database.
2. Enter Vitals:
   - BP: `120/80`
   - Heart Rate: `74`
   - SpO2: `99`
3. In **Dual-Coded Diagnoses**, type `Cholera` or `1A00` in the search box.
   - Point out the instant database autocomplete querying 36,757 entries.
   - Select `Cholera [1A00]`.
   - Point out the three traditional medicine equivalents:
     - **Ayurveda (NAMC):** *Visuchika* (NAMC-1A00) &bull; 92% Confidence
     - **Siddha (NAMC):** *Vantipel* (NAMC-1A00) &bull; 88% Confidence
     - **Unani (NUMC):** *Haiza* (NUMC-1A00) &bull; 95% Confidence
   - Toggle **Doctor Confirmed** checkbox (demonstrating Constraint C4: doctor-endorsed AYUSH codes).
4. Add Prescription:
   - Drug: `Sanjivani Vati 250mg`
   - Dosage: `1 tablet`
   - Frequency: `BD`
   - Instructions: `Take with warm water after meals`
5. Click **Publish & Generate FHIR**.
   - Notice the FHIR R4 Bundle modal opens with complete HL7 resources (`Patient`, `Practitioner`, `Encounter`, `Observation`, `Condition` with dual AYUSH coding, `MedicationRequest`).
   - Click **Copy JSON** or inspect the validated bundle.

---

### Minute 4:00 - 5:00 &bull; Grounded AI Clinical Assistant (RAG)
1. Navigate to `/doctor/translation` (Disease Code Translation & AI Assistant).
2. Type in the MedLink AI Assistant:
   `"What are the traditional medicine equivalents for Migraine BA00?"`
3. Observe real-time Server-Sent Events (SSE) streaming from the `ai-chat` Edge Function.
4. Point out that the response contains the exact grounded database table with confidence scores, running with **zero client-side Gemini secrets**.

---

### Minute 5:00 - 6:00 &bull; Patient Portal, Translations & Cryptographic Audit
1. Open an incognito window or sign out and sign in as **Patient**:
   - Identifier: `91-8842-1920-3341` &rarr; OTP `587315`.
2. **Patient Dashboard (`/patient`):**
   - Point out the newly published consultation in **Recent Visits**.
   - Show the interactive **Recharts Blood Pressure & Heart Rate trend line chart**.
3. **Indic Prescription Translation (`/patient/prescriptions`):**
   - Select **हिंदी (Hindi)** from the language dropdown.
   - Observe real-time translation of medications and instructions (`भोजन के बाद गुनगुने पानी के साथ लें`).
   - Click **Download Prescription (PDF)** &rarr; opens formatted clinical PDF.
4. **Consent & Cryptographic Audit Chain (`/patient/profile`):**
   - View official **ABHA QR Code**.
   - Switch to **Consent Manager** &rarr; displays Dr. Ananya Rao's active consent link with an immediate **Revoke Access** button.
   - Switch to **Activity & Audit Log** &rarr; highlight the green badge:
     `Cryptographic Chain Intact (SHA-256 Chained)`
   - Explains that any tampering with database logs will immediately flip the badge to red.

---

## Conclusion
MedLink demonstrates an end-to-end, production-grade integration of modern HL7 FHIR standards with India's traditional AYUSH medicine systems, backed by ABDM-compliant consent and cryptographic tamper-evidence.
