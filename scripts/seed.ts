import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Client } = pg;

const DB_URL =
  process.env.DB_URL ||
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runSeed() {
  console.log("🌱 Starting MedLink Database Seeding...");
  const isCloud = DB_URL.includes("supabase.co") || DB_URL.includes("supabase.com");
  const client = new Client({
    connectionString: DB_URL,
    ssl: isCloud ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  try {
    // 1. Bulk Load disease_mappings from conciseFinalData.csv if not already loaded
    const countRes = await client.query(
      "SELECT COUNT(*) FROM public.disease_mappings"
    );
    const existingCount = parseInt(countRes.rows[0].count, 10);
    console.log(`Current disease_mappings count: ${existingCount}`);

    const csvPath = path.resolve(process.cwd(), "public/conciseFinalData.csv");

    if (existingCount < 1000 && fs.existsSync(csvPath)) {
      console.log(`Reading CSV from ${csvPath} in batches of 500...`);
      const fileStream = fs.createReadStream(csvPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let isHeader = true;
      let batch: any[] = [];
      let totalInserted = 0;

      for await (const line of rl) {
        if (isHeader) {
          isHeader = false;
          continue;
        }

        // Parse CSV line handling quoted fields
        const cols = parseCsvLine(line);
        if (cols.length < 24) continue;

        const icdTitle = cols[1]?.trim();
        if (!icdTitle) continue;

        batch.push({
          icd11_title: icdTitle,
          icd11_code: cols[2]?.trim() || null,
          ayurveda_code: cols[6]?.trim() || null,
          ayurveda_term: cols[7]?.trim() || null,
          ayurveda_def: cols[10]?.trim() || null,
          siddha_code: cols[12]?.trim() || null,
          siddha_term: cols[13]?.trim() || null,
          siddha_def: cols[15]?.trim() || null,
          unani_code: cols[16]?.trim() || null,
          unani_term: cols[18]?.trim() || null,
          unani_def: cols[20]?.trim() || null,
          ayurveda_sim: parseFloat(cols[21]) || 0.8,
          siddha_sim: parseFloat(cols[22]) || 0.8,
          unani_sim: parseFloat(cols[23]) || 0.8,
        });

        if (batch.length >= 500) {
          await insertDiseaseBatch(client, batch);
          totalInserted += batch.length;
          batch = [];
          if (totalInserted % 5000 === 0) {
            console.log(`... inserted ${totalInserted} disease mappings`);
          }
        }
      }

      if (batch.length > 0) {
        await insertDiseaseBatch(client, batch);
        totalInserted += batch.length;
      }

      console.log(`✅ Loaded ${totalInserted} disease rows into disease_mappings.`);
    } else {
      console.log("ℹ️ disease_mappings already populated. Skipping bulk CSV import.");
    }

    // 2. Doctors
    const doctors = [
      {
        id: "00000000-0000-0000-0001-000000000001",
        name: "Dr. Ananya Rao",
        mobile: "9876543210",
        hpr: "HPR-1234-5678",
        reg: "MCI-2015-10291",
        email: "ananya.rao@medlink.app",
        specializations: ["Ayurveda", "General Medicine"],
        clinic: "Sushruta Wellness Clinic",
        address: "12 MI Road Jaipur",
        lat: 26.9124,
        lng: 75.7873,
        rating: 4.9,
      },
      {
        id: "00000000-0000-0000-0001-000000000002",
        name: "Dr. Rohan Mehta",
        mobile: "9876500001",
        hpr: "HPR-2345-6789",
        reg: "MCI-2017-38192",
        email: "rohan.mehta@medlink.app",
        specializations: ["Cardiology"],
        clinic: "Jaipur Heart Centre",
        address: "Bapu Nagar, Jaipur",
        lat: 26.89,
        lng: 75.81,
        rating: 4.8,
      },
      {
        id: "00000000-0000-0000-0001-000000000003",
        name: "Dr. Kavita Iyer",
        mobile: "9876500002",
        hpr: "HPR-3456-7890",
        reg: "MCI-2018-84729",
        email: "kavita.iyer@medlink.app",
        specializations: ["Siddha"],
        clinic: "Agathiyar Siddha Care",
        address: "Connaught Place, New Delhi",
        lat: 28.6304,
        lng: 77.2177,
        rating: 4.7,
      },
      {
        id: "00000000-0000-0000-0001-000000000004",
        name: "Dr. Imran Qureshi",
        mobile: "9876500003",
        hpr: null,
        reg: "MCI-2019-45123",
        email: "imran.qureshi@medlink.app",
        specializations: ["Unani"],
        clinic: "Ibn Sina Tibbi Clinic",
        address: "Chandni Chowk, Delhi",
        lat: 28.6506,
        lng: 77.2303,
        rating: 4.8,
      },
      {
        id: "00000000-0000-0000-0001-000000000005",
        name: "Dr. Neha Gupta",
        mobile: "9876500004",
        hpr: "HPR-4567-8901",
        reg: "MCI-2020-56281",
        email: "neha.gupta@medlink.app",
        specializations: ["Dermatology"],
        clinic: "Skin & Glow Centre",
        address: "Sector 18, Noida",
        lat: 28.5708,
        lng: 77.3271,
        rating: 4.6,
      },
      {
        id: "00000000-0000-0000-0001-000000000006",
        name: "Dr. Suresh Singh",
        mobile: "9876500005",
        hpr: "HPR-5678-9012",
        reg: "MCI-2016-19284",
        email: "suresh.singh@medlink.app",
        specializations: ["Pediatrics"],
        clinic: "Jaipur Children Hospital",
        address: "Tonk Road, Jaipur",
        lat: 26.87,
        lng: 75.8,
        rating: 4.9,
      },
    ];

    for (const doc of doctors) {
      // Upsert auth user via Supabase admin API
      try {
        await supabaseAdmin.auth.admin.deleteUser(doc.id);
      } catch {
        // user may not exist yet
      }
      await supabaseAdmin.auth.admin.createUser({
        id: doc.id,
        email: doc.email,
        email_confirm: true,
        user_metadata: { role: "doctor", full_name: doc.name },
      });

      // Upsert profiles
      await client.query(
        `INSERT INTO public.profiles (id, role, full_name, mobile, email, hpr_id, council_reg_no, claimed)
         VALUES ($1, 'doctor', $2, $3, $4, $5, $6, true)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           mobile = EXCLUDED.mobile,
           hpr_id = EXCLUDED.hpr_id,
           council_reg_no = EXCLUDED.council_reg_no`,
        [doc.id, doc.name, doc.mobile, doc.email, doc.hpr, doc.reg]
      );

      // Upsert doctor_details
      await client.query(
        `INSERT INTO public.doctor_details (user_id, specializations, clinic_name, address, lat, lng, rating, slot_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 30)
         ON CONFLICT (user_id) DO UPDATE SET
           specializations = EXCLUDED.specializations,
           clinic_name = EXCLUDED.clinic_name,
           address = EXCLUDED.address,
           lat = EXCLUDED.lat,
           lng = EXCLUDED.lng,
           rating = EXCLUDED.rating`,
        [
          doc.id,
          doc.specializations,
          doc.clinic,
          doc.address,
          doc.lat,
          doc.lng,
          doc.rating,
        ]
      );
    }
    console.log(`✅ Seeded ${doctors.length} doctors.`);

    // 3. Patients
    const patients = [
      {
        id: "00000000-0000-0000-0002-000000000001",
        name: "Priya Sharma",
        mobile: "9123456789",
        abha: "91884219203341",
        abha_formatted: "91-8842-1920-3341",
        abha_addr: "priyasharma@abdm",
        lang: "हिन्दी (Hindi)",
        dob: "1995-04-12",
        gender: "female",
        blood_group: "B+",
      },
      {
        id: "00000000-0000-0000-0002-000000000002",
        name: "Rahul Kumar",
        mobile: "9123456780",
        abha: "91123456789012",
        abha_formatted: "91-1234-5678-9012",
        abha_addr: "rahulk@abdm",
        lang: "English",
        dob: "1988-08-20",
        gender: "male",
        blood_group: "O+",
      },
      {
        id: "00000000-0000-0000-0002-000000000003",
        name: "Amit Verma",
        mobile: "9123456781",
        abha: "91234567890123",
        abha_formatted: "91-2345-6789-0123",
        abha_addr: "amitverma@abdm",
        lang: "English",
        dob: "1992-11-05",
        gender: "male",
        blood_group: "A+",
      },
      {
        id: "00000000-0000-0000-0002-000000000004",
        name: "Sneha Patel",
        mobile: "9123456782",
        abha: "91345678901234",
        abha_formatted: "91-3456-7890-1234",
        abha_addr: "snehap@abdm",
        lang: "ગુજરાતી (Gujarati)",
        dob: "1998-02-14",
        gender: "female",
        blood_group: "AB+",
      },
    ];

    for (const pat of patients) {
      const email = `${pat.id}@users.medlink.app`;
      try {
        await supabaseAdmin.auth.admin.deleteUser(pat.id);
      } catch {
        // user may not exist yet
      }
      await supabaseAdmin.auth.admin.createUser({
        id: pat.id,
        email: email,
        email_confirm: true,
        user_metadata: { role: "patient", full_name: pat.name },
      });

      await client.query(
        `INSERT INTO public.profiles (id, role, full_name, mobile, email, abha_number, abha_address, preferred_language, dob, gender, blood_group, claimed)
         VALUES ($1, 'patient', $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           mobile = EXCLUDED.mobile,
           abha_number = EXCLUDED.abha_number,
           abha_address = EXCLUDED.abha_address`,
        [
          pat.id,
          pat.name,
          pat.mobile,
          email,
          pat.abha,
          pat.abha_addr,
          pat.lang,
          pat.dob,
          pat.gender,
          pat.blood_group,
        ]
      );

      await client.query(
        `INSERT INTO public.patient_identifiers (patient_id, type, value)
         VALUES ($1, 'abha', $2), ($1, 'phone', $3)
         ON CONFLICT (patient_id, type, value) DO NOTHING`,
        [pat.id, pat.abha, pat.mobile]
      );
    }
    console.log(`✅ Seeded ${patients.length} patients.`);

    // Reconcile Gotrue auth.users and identities
    await client.query(`
      UPDATE auth.users SET
        instance_id = '00000000-0000-0000-0000-000000000000',
        created_at = COALESCE(created_at, now()),
        updated_at = COALESCE(updated_at, now()),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        is_anonymous = COALESCE(is_anonymous, false),
        encrypted_password = COALESCE(encrypted_password, '$2a$10$j04W6QjLVWZBjkdOwwKcbuqRMP.XRrDdf1JVFYOIeAUZFxVHit3Ma')
    `);

    const allUsers = await client.query("SELECT id, email FROM auth.users");
    for (const u of allUsers.rows) {
      await client.query(`
        INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (gen_random_uuid(), $1::text, $2::uuid, json_build_object('sub', $1::text, 'email', $3::text, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now())
        ON CONFLICT (provider, provider_id) DO NOTHING
      `, [u.id, u.id, u.email]);
    }

    // 4. Doctor-Patient Links (Consent)
    const drRaoId = doctors[0].id;
    const drMehtaId = doctors[1].id;

    for (const pat of patients) {
      await client.query(
        `INSERT INTO public.doctor_patient_links (doctor_id, patient_id, status, linked_at)
         VALUES ($1, $2, 'active', now() - interval '30 days')
         ON CONFLICT (doctor_id, patient_id) DO UPDATE SET status = 'active'`,
        [drRaoId, pat.id]
      );
    }

    // Priya also linked to Dr. Mehta
    await client.query(
      `INSERT INTO public.doctor_patient_links (doctor_id, patient_id, status, linked_at)
       VALUES ($1, $2, 'active', now() - interval '15 days')
       ON CONFLICT (doctor_id, patient_id) DO UPDATE SET status = 'active'`,
      [drMehtaId, patients[0].id]
    );

    console.log(`✅ Seeded doctor-patient links.`);

    // 5. Consultations, Diagnoses, Medications, and FHIR Bundles
    // Fetch a few disease mapping IDs
    const diseaseRes = await client.query(
      `SELECT id, icd11_title, icd11_code, ayurveda_term, ayurveda_code, ayurveda_sim,
              siddha_term, siddha_code, siddha_sim, unani_term, unani_code, unani_sim
       FROM public.disease_mappings
       ORDER BY id ASC LIMIT 10`
    );
    const sampleDiseases = diseaseRes.rows;

    const vitalsSamples = [
      { bp: "120/80", heartRate: 72, spo2: 98, temp: 98.6, weight: 68 },
      { bp: "124/82", heartRate: 75, spo2: 99, temp: 98.4, weight: 68.5 },
      { bp: "128/84", heartRate: 80, spo2: 97, temp: 99.1, weight: 69 },
      { bp: "118/78", heartRate: 70, spo2: 98, temp: 98.6, weight: 68.2 },
      { bp: "122/80", heartRate: 74, spo2: 98, temp: 98.5, weight: 68.4 },
      { bp: "130/85", heartRate: 82, spo2: 97, temp: 99.4, weight: 69.1 },
      { bp: "125/82", heartRate: 76, spo2: 99, temp: 98.6, weight: 68.8 },
      { bp: "120/78", heartRate: 72, spo2: 98, temp: 98.6, weight: 68.6 },
      { bp: "116/76", heartRate: 68, spo2: 99, temp: 98.2, weight: 68.3 },
      { bp: "122/80", heartRate: 74, spo2: 98, temp: 98.6, weight: 68.5 },
    ];

    const priyaId = patients[0].id;

    for (let i = 0; i < 10; i++) {
      const consultId = `00000000-0000-0003-0001-${(i + 1).toString().padStart(12, "0")}`;
      const daysAgo = 55 - i * 5;
      const startedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
      const publishedAt = new Date(Date.now() - daysAgo * 86400000 + 1200000).toISOString();
      const vit = vitalsSamples[i];

      const patientForConsult = i < 7 ? priyaId : patients[i % patients.length].id;

      await client.query(
        `INSERT INTO public.consultations (id, doctor_id, patient_id, status, vitals, chief_complaint, started_at, published_at, duration_seconds)
         VALUES ($1, $2, $3, 'published', $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          consultId,
          drRaoId,
          patientForConsult,
          JSON.stringify(vit),
          i % 2 === 0 ? "Fever, mild headache and fatigue" : "Abdominal discomfort and indigestion",
          startedAt,
          publishedAt,
          720 + i * 30,
        ]
      );

      // Diagnosis
      const disease = sampleDiseases[i % sampleDiseases.length] || {
        id: 1,
        icd11_title: "General Malaise",
        icd11_code: "1A00",
        ayurveda_term: "Jvara",
        ayurveda_code: "AAA-1",
        ayurveda_sim: 0.9,
      };

      await client.query(
        `INSERT INTO public.consultation_diagnoses (consultation_id, disease_id, confirmed_by_doctor, note)
         VALUES ($1, $2, true, 'Confirmed diagnosis grounded in ICD-11 and AYUSH vocabularies')
         ON CONFLICT DO NOTHING`,
        [consultId, disease.id]
      );

      // Medications
      const med1Id = `00000000-0000-0004-0001-${(i * 2 + 1).toString().padStart(12, "0")}`;
      await client.query(
        `INSERT INTO public.medications (id, consultation_id, drug, dosage, frequency, duration_days, instructions, sort)
         VALUES ($1, $2, 'Sudarshan Vati', '500 mg', 'bd', 5, 'Take after meals with warm water', 1)
         ON CONFLICT DO NOTHING`,
        [med1Id, consultId]
      );

      // Seed translation
      await client.query(
        `INSERT INTO public.prescription_translations (medication_id, lang, drug_text, instructions_text)
         VALUES ($1, 'hi', 'सुदर्शन वटी', 'भोजन के बाद गुनगुने पानी के साथ लें')
         ON CONFLICT DO NOTHING`,
        [med1Id]
      );

      // FHIR Bundle
      const fhirJson = {
        resourceType: "Bundle",
        id: `bundle-${consultId}`,
        type: "transaction",
        timestamp: publishedAt,
        entry: [
          {
            fullUrl: `urn:uuid:patient-${patientForConsult}`,
            resource: {
              resourceType: "Patient",
              id: patientForConsult,
              name: [{ use: "official", text: i < 7 ? "Priya Sharma" : "Rahul Kumar" }],
            },
          },
          {
            fullUrl: `urn:uuid:practitioner-${drRaoId}`,
            resource: {
              resourceType: "Practitioner",
              id: drRaoId,
              name: [{ use: "official", text: "Dr. Ananya Rao" }],
            },
          },
          {
            fullUrl: `urn:uuid:observation-bp-${consultId}`,
            resource: {
              resourceType: "Observation",
              code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }] },
              component: [
                { code: { coding: [{ code: "8480-6" }] }, valueQuantity: { value: parseInt(vit.bp.split("/")[0]) } },
                { code: { coding: [{ code: "8462-4" }] }, valueQuantity: { value: parseInt(vit.bp.split("/")[1]) } },
              ],
            },
          },
        ],
      };

      await client.query(
        `INSERT INTO public.fhir_bundles (consultation_id, bundle, version, published, validation)
         VALUES ($1, $2, 1, true, '{"ok":true,"errors":[]}')
         ON CONFLICT (consultation_id) DO NOTHING`,
        [consultId, JSON.stringify(fhirJson)]
      );
    }
    console.log(`✅ Seeded 10 published consultations with FHIR bundles.`);

    // 2 Drafts for Dr. Rao
    for (let d = 1; d <= 2; d++) {
      const draftId = `00000000-0000-0003-0002-00000000000${d}`;
      await client.query(
        `INSERT INTO public.consultations (id, doctor_id, patient_id, status, vitals, chief_complaint, started_at)
         VALUES ($1, $2, $3, 'draft', '{"bp":"122/82","heartRate":76,"spo2":98,"temp":98.6,"weight":70}', 'Routine check-up in progress', now())
         ON CONFLICT (id) DO NOTHING`,
        [draftId, drRaoId, patients[d].id]
      );
    }
    console.log(`✅ Seeded 2 draft consultations.`);

    // 6. Appointments
    // 2 pending appointments for tomorrow for Dr. Rao
    const tomorrow1 = new Date();
    tomorrow1.setDate(tomorrow1.getDate() + 1);
    tomorrow1.setHours(10, 0, 0, 0);

    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 1);
    tomorrow2.setHours(11, 30, 0, 0);

    await client.query(
      `INSERT INTO public.appointments (doctor_id, patient_id, starts_at, duration_min, type, status, notes)
       VALUES
         ($1, $2, $3, 30, 'New Consultation', 'pending', 'Follow-up for seasonal allergies'),
         ($1, $4, $5, 30, 'Follow-up', 'pending', 'Checking response to herbal medication')
       ON CONFLICT DO NOTHING`,
      [drRaoId, priyaId, tomorrow1.toISOString(), patients[1].id, tomorrow2.toISOString()]
    );

    // Other appointments (approved, completed, cancelled)
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString();

    await client.query(
      `INSERT INTO public.appointments (doctor_id, patient_id, starts_at, duration_min, type, status, notes)
       VALUES
         ($1, $2, $3, 30, 'Follow-up', 'approved', 'Reviewing vitals and progress'),
         ($1, $4, $5, 30, 'Lab Review', 'completed', 'Discussed blood report results'),
         ($1, $6, $7, 30, 'New Consultation', 'cancelled', 'Patient rescheduled')
       ON CONFLICT DO NOTHING`,
      [drRaoId, priyaId, nextWeek, patients[1].id, yesterday, patients[2].id, twoDaysAgo]
    );

    console.log(`✅ Seeded appointments.`);

    // 7. Documents
    const documents = [
      {
        id: "00000000-0000-0005-0001-000000000001",
        name: "Complete Blood Count (CBC).pdf",
        type: "Lab Report",
        size: 245000,
        mime: "application/pdf",
        path: `${priyaId}/cbc_report.pdf`,
      },
      {
        id: "00000000-0000-0005-0001-000000000002",
        name: "Chest X-Ray Digital.png",
        type: "Imaging",
        size: 1420000,
        mime: "image/png",
        path: `${priyaId}/chest_xray.png`,
      },
      {
        id: "00000000-0000-0005-0001-000000000003",
        name: "Previous Prescription 2025.pdf",
        type: "Prescription",
        size: 110000,
        mime: "application/pdf",
        path: `${priyaId}/prev_presc.pdf`,
      },
      {
        id: "00000000-0000-0005-0001-000000000004",
        name: "Lipid Profile Panel.pdf",
        type: "Lab Report",
        size: 180000,
        mime: "application/pdf",
        path: `${priyaId}/lipid_profile.pdf`,
      },
      {
        id: "00000000-0000-0005-0001-000000000005",
        name: "Discharge Summary Apollo.pdf",
        type: "Other",
        size: 520000,
        mime: "application/pdf",
        path: `${priyaId}/discharge_summary.pdf`,
      },
    ];

    for (const doc of documents) {
      await client.query(
        `INSERT INTO public.documents (id, patient_id, name, doc_type, size_bytes, mime, storage_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [doc.id, priyaId, doc.name, doc.type, doc.size, doc.mime, doc.path]
      );

      // Share first 3 with Dr. Rao
      await client.query(
        `INSERT INTO public.document_shares (document_id, doctor_id)
         VALUES ($1, $2)
         ON CONFLICT (document_id, doctor_id) DO NOTHING`,
        [doc.id, drRaoId]
      );
    }
    console.log(`✅ Seeded 5 patient documents.`);

    // 8. Notifications
    const notifs = [
      { user_id: drRaoId, title: "New Appointment Request", body: "Priya Sharma booked a slot for tomorrow 10:00 AM", kind: "appointment", link: "/doctor/appointments" },
      { user_id: drRaoId, title: "Patient Record Shared", body: "Priya Sharma shared Complete Blood Count (CBC).pdf", kind: "document", link: `/doctor/patients/${priyaId}` },
      { user_id: drRaoId, title: "System Ready", body: "Dual-coding engine active with 36,782 terminology mappings.", kind: "system", link: "/doctor" },
      { user_id: drRaoId, title: "Lab Results In", body: "Rahul Kumar uploaded recent pathology test.", kind: "document", link: "/doctor/patients" },
      { user_id: drRaoId, title: "Appointment Completed", body: "Consultation marked completed for Amit Verma.", kind: "appointment", link: "/doctor/appointments" },
      { user_id: drRaoId, title: "Security Audit", body: "Hash-chain integrity check passed.", kind: "system", link: "/doctor" },
      { user_id: priyaId, title: "Consultation Published", body: "Dr. Ananya Rao published your health record & FHIR bundle.", kind: "record", link: "/patient/records" },
      { user_id: priyaId, title: "Appointment Confirmed", body: "Your appointment for tomorrow 10:00 AM is approved.", kind: "appointment", link: "/patient/appointments" },
      { user_id: priyaId, title: "Prescription Ready", body: "Prescription translation available in Hindi and English.", kind: "prescription", link: "/patient/prescriptions" },
      { user_id: priyaId, title: "Consent Active", body: "Dr. Ananya Rao has active consultation access.", kind: "consent", link: "/patient/profile" },
      { user_id: priyaId, title: "Health Update", body: "Blood pressure trends have stabilized.", kind: "health", link: "/patient" },
      { user_id: priyaId, title: "Welcome to MedLink", body: "Your digital health records are securely linked with ABHA.", kind: "system", link: "/patient/profile" },
    ];

    for (const n of notifs) {
      await client.query(
        `INSERT INTO public.notifications (user_id, title, body, kind, link, read)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [n.user_id, n.title, n.body, n.kind, n.link]
      );
    }
    console.log(`✅ Seeded 12 notifications.`);

    // 9. Initial Audit Log
    await client.query(
      `SELECT public.write_audit($1, 'system_seed', 'database', 'medlink-production-v1', '{"initialized":true}'::jsonb)`,
      [drRaoId]
    );
    console.log(`✅ Initial audit log entry generated.`);

    console.log("\n=======================================================");
    console.log("🎉 SEEDING COMPLETE! Ready for PBL Demo.");
    console.log("=======================================================");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

async function insertDiseaseBatch(client: any, batch: any[]) {
  const valueClauses: string[] = [];
  const params: any[] = [];
  let pIdx = 1;

  for (const row of batch) {
    valueClauses.push(
      `($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`
    );
    params.push(
      row.icd11_title,
      row.icd11_code,
      row.ayurveda_term,
      row.ayurveda_code,
      row.ayurveda_sim,
      row.ayurveda_def,
      row.siddha_term,
      row.siddha_code,
      row.siddha_sim,
      row.siddha_def,
      row.unani_term,
      row.unani_code,
      row.unani_sim,
      row.unani_def
    );
  }

  const query = `
    INSERT INTO public.disease_mappings (
      icd11_title, icd11_code,
      ayurveda_term, ayurveda_code, ayurveda_sim, ayurveda_def,
      siddha_term, siddha_code, siddha_sim, siddha_def,
      unani_term, unani_code, unani_sim, unani_def
    ) VALUES ${valueClauses.join(", ")}
  `;

  await client.query(query, params);
}

runSeed().catch((e) => {
  console.error(e);
  process.exit(1);
});
