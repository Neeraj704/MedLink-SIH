export interface VitalsInput {
  bp?: string;
  heartRate?: number | string;
  spo2?: number | string;
  temp?: number | string;
  weight?: number | string;
}

export interface DiagnosisInput {
  id: string;
  confirmed_by_doctor: boolean;
  disease: {
    icd11_title: string;
    icd11_code?: string | null;
    ayurveda_term?: string | null;
    ayurveda_code?: string | null;
    ayurveda_sim?: number | null;
    siddha_term?: string | null;
    siddha_code?: string | null;
    siddha_sim?: number | null;
    unani_term?: string | null;
    unani_code?: string | null;
    unani_sim?: number | null;
  };
  note?: string;
}

export interface MedicationInput {
  id: string;
  drug: string;
  dosage: string;
  frequency: "od" | "bd" | "tds" | "sos" | string;
  duration_days: number;
  instructions?: string;
}

export interface PatientProfileInput {
  id: string;
  full_name: string;
  mobile?: string | null;
  abha_number?: string | null;
  abha_address?: string | null;
  dob?: string | null;
  gender?: string | null;
}

export interface DoctorProfileInput {
  id: string;
  full_name: string;
  hpr_id?: string | null;
  council_reg_no?: string | null;
}

export interface ConsultationInput {
  id: string;
  started_at: string;
  published_at?: string | null;
  chief_complaint?: string | null;
  vitals?: VitalsInput;
}

export function buildBundle(
  consultation: ConsultationInput,
  patient: PatientProfileInput,
  doctor: DoctorProfileInput,
  diagnoses: DiagnosisInput[],
  medications: MedicationInput[]
) {
  const patientFullUrl = `urn:uuid:patient-${patient.id}`;
  const practitionerFullUrl = `urn:uuid:practitioner-${doctor.id}`;
  const encounterFullUrl = `urn:uuid:encounter-${consultation.id}`;

  const entries: any[] = [];
  const fullUrls = new Set<string>();

  // 1. Patient Resource
  const patientIdentifiers: any[] = [];
  if (patient.abha_number) {
    patientIdentifiers.push({
      system: "https://healthid.ndhm.gov.in",
      value: patient.abha_number,
      use: "official",
    });
  }
  if (patient.abha_address) {
    patientIdentifiers.push({
      system: "https://abdm.gov.in/abha-address",
      value: patient.abha_address,
    });
  }

  const patientResource: any = {
    fullUrl: patientFullUrl,
    resource: {
      resourceType: "Patient",
      id: patient.id,
      identifier: patientIdentifiers,
      name: [{ use: "official", text: patient.full_name }],
      gender: patient.gender ? patient.gender.toLowerCase() : "unknown",
      ...(patient.dob ? { birthDate: patient.dob } : {}),
      ...(patient.mobile
        ? {
            telecom: [
              {
                system: "phone",
                value: patient.mobile.startsWith("+91")
                  ? patient.mobile
                  : `+91${patient.mobile}`,
                use: "mobile",
              },
            ],
          }
        : {}),
    },
    request: { method: "PUT", url: `Patient/${patient.id}` },
  };
  entries.push(patientResource);
  fullUrls.add(patientFullUrl);

  // 2. Practitioner Resource
  const practitionerIdentifiers: any[] = [];
  if (doctor.hpr_id) {
    practitionerIdentifiers.push({
      system: "https://doctor.ndhm.gov.in",
      value: doctor.hpr_id,
      use: "official",
    });
  }
  if (doctor.council_reg_no) {
    practitionerIdentifiers.push({
      system: "https://nmc.org.in/registration",
      value: doctor.council_reg_no,
    });
  }

  const practitionerResource: any = {
    fullUrl: practitionerFullUrl,
    resource: {
      resourceType: "Practitioner",
      id: doctor.id,
      identifier: practitionerIdentifiers,
      name: [{ use: "official", text: doctor.full_name }],
    },
    request: { method: "PUT", url: `Practitioner/${doctor.id}` },
  };
  entries.push(practitionerResource);
  fullUrls.add(practitionerFullUrl);

  // 3. Encounter Resource
  const encounterResource: any = {
    fullUrl: encounterFullUrl,
    resource: {
      resourceType: "Encounter",
      id: consultation.id,
      status: "finished",
      class: {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "AMB",
        display: "ambulatory",
      },
      subject: { reference: patientFullUrl, display: patient.full_name },
      participant: [
        {
          individual: {
            reference: practitionerFullUrl,
            display: doctor.full_name,
          },
        },
      ],
      period: {
        start: consultation.started_at,
        end: consultation.published_at || new Date().toISOString(),
      },
      ...(consultation.chief_complaint
        ? {
            reasonCode: [
              {
                text: consultation.chief_complaint,
              },
            ],
          }
        : {}),
    },
    request: { method: "PUT", url: `Encounter/${consultation.id}` },
  };
  entries.push(encounterResource);
  fullUrls.add(encounterFullUrl);

  // 4. Observations (Vitals)
  const vitals = consultation.vitals || {};
  if (vitals.bp) {
    const bpMatch = vitals.bp.match(/(\d+)\s*\/\s*(\d+)/);
    const systolic = bpMatch ? parseInt(bpMatch[1], 10) : 120;
    const diastolic = bpMatch ? parseInt(bpMatch[2], 10) : 80;
    const bpUrl = `urn:uuid:observation-bp-${consultation.id}`;

    entries.push({
      fullUrl: bpUrl,
      resource: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "85354-9",
              display: "Blood pressure panel with all children optional",
            },
          ],
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        effectiveDateTime: consultation.started_at,
        component: [
          {
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8480-6",
                  display: "Systolic blood pressure",
                },
              ],
            },
            valueQuantity: {
              value: systolic,
              unit: "mm[Hg]",
              system: "http://unitsofmeasure.org",
              code: "mm[Hg]",
            },
          },
          {
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8462-4",
                  display: "Diastolic blood pressure",
                },
              ],
            },
            valueQuantity: {
              value: diastolic,
              unit: "mm[Hg]",
              system: "http://unitsofmeasure.org",
              code: "mm[Hg]",
            },
          },
        ],
      },
      request: { method: "POST", url: "Observation" },
    });
    fullUrls.add(bpUrl);
  }

  if (vitals.heartRate) {
    const hrVal = Number(vitals.heartRate) || 72;
    const hrUrl = `urn:uuid:observation-hr-${consultation.id}`;
    entries.push({
      fullUrl: hrUrl,
      resource: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8867-4",
              display: "Heart rate",
            },
          ],
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        valueQuantity: {
          value: hrVal,
          unit: "/min",
          system: "http://unitsofmeasure.org",
          code: "/min",
        },
      },
      request: { method: "POST", url: "Observation" },
    });
    fullUrls.add(hrUrl);
  }

  if (vitals.spo2) {
    const spo2Val = Number(vitals.spo2) || 98;
    const spo2Url = `urn:uuid:observation-spo2-${consultation.id}`;
    entries.push({
      fullUrl: spo2Url,
      resource: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "59408-5",
              display: "Oxygen saturation in Arterial blood by Pulse oximetry",
            },
          ],
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        valueQuantity: {
          value: spo2Val,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
      },
      request: { method: "POST", url: "Observation" },
    });
    fullUrls.add(spo2Url);
  }

  if (vitals.temp) {
    const tempVal = Number(vitals.temp) || 98.6;
    const tempUrl = `urn:uuid:observation-temp-${consultation.id}`;
    entries.push({
      fullUrl: tempUrl,
      resource: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8310-5",
              display: "Body temperature",
            },
          ],
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        valueQuantity: {
          value: tempVal,
          unit: "degF",
          system: "http://unitsofmeasure.org",
          code: "[degF]",
        },
      },
      request: { method: "POST", url: "Observation" },
    });
    fullUrls.add(tempUrl);
  }

  if (vitals.weight) {
    const weightVal = Number(vitals.weight) || 70;
    const weightUrl = `urn:uuid:observation-weight-${consultation.id}`;
    entries.push({
      fullUrl: weightUrl,
      resource: {
        resourceType: "Observation",
        status: "final",
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "29463-7",
              display: "Body weight",
            },
          ],
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        valueQuantity: {
          value: weightVal,
          unit: "kg",
          system: "http://unitsofmeasure.org",
          code: "kg",
        },
      },
      request: { method: "POST", url: "Observation" },
    });
    fullUrls.add(weightUrl);
  }

  // 5. Conditions per diagnosis
  for (let idx = 0; idx < diagnoses.length; idx++) {
    const d = diagnoses[idx];
    const condUrl = `urn:uuid:condition-${consultation.id}-${idx}`;
    const codings: any[] = [];

    if (d.disease.icd11_code) {
      codings.push({
        system: "http://id.who.int/icd/release/11/mms",
        code: d.disease.icd11_code,
        display: d.disease.icd11_title,
      });
    }

    if (d.disease.ayurveda_code && d.disease.ayurveda_term) {
      codings.push({
        system: "https://ndhm.gov.in/fhir/CodeSystem/namaste-ayurveda",
        code: d.disease.ayurveda_code,
        display: d.disease.ayurveda_term,
        extension: [
          {
            url: "https://medlink.app/fhir/StructureDefinition/mapping-confidence",
            valueDecimal: d.disease.ayurveda_sim ?? 0.8,
          },
        ],
      });
    }

    if (d.disease.siddha_code && d.disease.siddha_term) {
      codings.push({
        system: "https://ndhm.gov.in/fhir/CodeSystem/namaste-siddha",
        code: d.disease.siddha_code,
        display: d.disease.siddha_term,
        extension: [
          {
            url: "https://medlink.app/fhir/StructureDefinition/mapping-confidence",
            valueDecimal: d.disease.siddha_sim ?? 0.8,
          },
        ],
      });
    }

    if (d.disease.unani_code && d.disease.unani_term) {
      codings.push({
        system: "https://ndhm.gov.in/fhir/CodeSystem/numc-unani",
        code: d.disease.unani_code,
        display: d.disease.unani_term,
        extension: [
          {
            url: "https://medlink.app/fhir/StructureDefinition/mapping-confidence",
            valueDecimal: d.disease.unani_sim ?? 0.8,
          },
        ],
      });
    }

    entries.push({
      fullUrl: condUrl,
      resource: {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        verificationStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-ver-status",
              code: d.confirmed_by_doctor ? "confirmed" : "provisional",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "encounter-diagnosis",
              },
            ],
          },
        ],
        code: {
          coding: codings,
          text: d.disease.icd11_title,
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        recordedDate: consultation.started_at,
        ...(d.note ? { note: [{ text: d.note }] } : {}),
      },
      request: { method: "POST", url: "Condition" },
    });
    fullUrls.add(condUrl);
  }

  // 6. MedicationRequests
  const freqRepeatMap: Record<string, number> = {
    od: 1,
    bd: 2,
    tds: 3,
    sos: 0,
  };

  for (let idx = 0; idx < medications.length; idx++) {
    const med = medications[idx];
    const medUrl = `urn:uuid:medicationrequest-${consultation.id}-${idx}`;
    const frequencyCode = (med.frequency || "od").toLowerCase();
    const frequencyPerDay = freqRepeatMap[frequencyCode] ?? 1;

    entries.push({
      fullUrl: medUrl,
      resource: {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          text: med.drug,
        },
        subject: { reference: patientFullUrl },
        encounter: { reference: encounterFullUrl },
        authoredOn: consultation.started_at,
        requester: { reference: practitionerFullUrl },
        dosageInstruction: [
          {
            text: `${med.dosage} ${med.frequency.toUpperCase()} for ${med.duration_days} days. ${med.instructions || ""}`.trim(),
            timing: {
              repeat: {
                frequency: frequencyPerDay > 0 ? frequencyPerDay : 1,
                period: 1,
                periodUnit: "d",
              },
            },
            doseAndRate: [
              {
                doseQuantity: {
                  value: 1,
                  unit: med.dosage,
                },
              },
            ],
            ...(med.instructions
              ? { additionalInstruction: [{ text: med.instructions }] }
              : {}),
          },
        ],
        dispenseRequest: {
          expectedSupplyDuration: {
            value: med.duration_days || 5,
            unit: "days",
            system: "http://unitsofmeasure.org",
            code: "d",
          },
        },
      },
      request: { method: "POST", url: "MedicationRequest" },
    });
    fullUrls.add(medUrl);
  }

  const bundle = {
    resourceType: "Bundle",
    id: `bundle-${consultation.id}`,
    type: "transaction",
    timestamp: new Date().toISOString(),
    entry: entries,
  };

  // Validation
  const errors: string[] = [];
  if (!patient.id) errors.push("Patient ID is missing");
  if (!doctor.id) errors.push("Doctor ID is missing");
  if (!consultation.id) errors.push("Consultation ID is missing");

  // Check duplicate fullUrls
  const seenUrls = new Set<string>();
  for (const entry of entries) {
    if (seenUrls.has(entry.fullUrl)) {
      errors.push(`Duplicate fullUrl: ${entry.fullUrl}`);
    }
    seenUrls.add(entry.fullUrl);
  }

  // Check references
  for (const entry of entries) {
    const res = entry.resource;
    if (res.subject?.reference && !fullUrls.has(res.subject.reference)) {
      errors.push(`Unresolved subject reference: ${res.subject.reference}`);
    }
    if (res.encounter?.reference && !fullUrls.has(res.encounter.reference)) {
      errors.push(`Unresolved encounter reference: ${res.encounter.reference}`);
    }
    if (res.requester?.reference && !fullUrls.has(res.requester.reference)) {
      errors.push(`Unresolved requester reference: ${res.requester.reference}`);
    }
  }

  return {
    bundle,
    validation: {
      ok: errors.length === 0,
      errors,
    },
  };
}
