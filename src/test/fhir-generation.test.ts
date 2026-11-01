import { describe, it, expect } from "vitest";

describe("HL7 FHIR R4 Bundle Construction & Compliance", () => {
  it("constructs a valid FHIR R4 Bundle with all required resources", () => {
    const timestamp = new Date().toISOString();
    const patientRef = "urn:uuid:patient-001";
    const doctorRef = "urn:uuid:practitioner-001";
    const encounterRef = "urn:uuid:encounter-001";

    const bundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp,
      entry: [
        {
          fullUrl: patientRef,
          resource: {
            resourceType: "Patient",
            id: "patient-001",
            name: [{ text: "Priya Sharma" }],
            identifier: [
              {
                system: "https://healthid.ndhm.gov.in",
                value: "91-8842-1920-3341",
              },
            ],
            gender: "female",
            birthDate: "1994-06-18",
          },
        },
        {
          fullUrl: doctorRef,
          resource: {
            resourceType: "Practitioner",
            id: "practitioner-001",
            name: [{ text: "Dr. Ananya Rao" }],
            identifier: [
              {
                system: "https://hpr.abdm.gov.in",
                value: "HPR-1234-5678",
              },
            ],
          },
        },
        {
          fullUrl: encounterRef,
          resource: {
            resourceType: "Encounter",
            status: "finished",
            class: {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
              code: "AMB",
              display: "ambulatory",
            },
            subject: { reference: patientRef },
            participant: [{ individual: { reference: doctorRef } }],
          },
        },
        {
          resource: {
            resourceType: "Condition",
            clinicalStatus: {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                  code: "active",
                },
              ],
            },
            code: {
              coding: [
                {
                  system: "http://id.who.int/icd/release/11",
                  code: "1A00",
                  display: "Cholera",
                },
                {
                  system: "https://ayush.gov.in/namc/ayurveda",
                  code: "NAMC-1A00",
                  display: "Visuchika",
                },
                {
                  system: "https://ayush.gov.in/numc/unani",
                  code: "NUMC-1A00",
                  display: "Haiza",
                },
              ],
              text: "Cholera",
            },
            subject: { reference: patientRef },
            encounter: { reference: encounterRef },
          },
        },
        {
          resource: {
            resourceType: "MedicationRequest",
            status: "active",
            intent: "order",
            medicationCodeableConcept: {
              text: "Sanjivani Vati 250mg",
            },
            dosageInstruction: [
              {
                text: "1 tab twice daily with warm water",
              },
            ],
            subject: { reference: patientRef },
            encounter: { reference: encounterRef },
          },
        },
      ],
    };

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("document");
    expect(bundle.entry).toHaveLength(5);

    // Verify Condition resource has both ICD-11 and AYUSH codings
    const conditionEntry = bundle.entry.find(
      (e) => e.resource.resourceType === "Condition"
    );
    expect(conditionEntry).toBeDefined();

    const codings = conditionEntry!.resource.code.coding;
    const icdCoding = codings.find(
      (c: { system: string }) => c.system === "http://id.who.int/icd/release/11"
    );
    const ayushCoding = codings.find((c: { system: string }) =>
      c.system.includes("ayush.gov.in")
    );

    expect(icdCoding?.code).toBe("1A00");
    expect(ayushCoding?.display).toBe("Visuchika");
  });
});
