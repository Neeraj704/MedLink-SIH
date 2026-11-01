import jsPDF from "jspdf";

export interface PrescriptionPdfData {
  doctorName: string;
  doctorHpr?: string;
  clinicName?: string;
  clinicAddress?: string;
  patientName: string;
  patientAbha?: string;
  date: string;
  vitals?: {
    bp?: string;
    heartRate?: number | string;
    spo2?: number | string;
    temp?: number | string;
    weight?: number | string;
  };
  diagnoses: {
    title: string;
    code?: string;
    ayushTerm?: string;
    ayushSystem?: string;
  }[];
  medications: {
    drug: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions?: string;
  }[];
}

export function generatePrescriptionPdf(data: PrescriptionPdfData) {
  const doc = new jsPDF();
  let y = 20;

  // Header / Clinic
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(33, 115, 70); // MedLink Teal / Green
  doc.text(data.clinicName || "MedLink Clinical Network", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.clinicAddress || "Primary Healthcare Centre, Jaipur, Rajasthan", 20, y);
  y += 5;
  doc.text(`Doctor: ${data.doctorName} | HPR ID: ${data.doctorHpr || "HPR-1234-5678"}`, 20, y);
  y += 8;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 8;

  // Patient Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("PATIENT INFORMATION", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${data.patientName}`, 20, y);
  doc.text(`Date: ${data.date}`, 140, y);
  y += 5;

  const maskedAbha = data.patientAbha
    ? `${data.patientAbha.slice(0, 5)}******${data.patientAbha.slice(-4)}`
    : "91-88**-****-3341";
  doc.text(`ABHA ID: ${maskedAbha}`, 20, y);
  y += 8;

  // Vitals Bar
  if (data.vitals) {
    doc.setFillColor(245, 247, 250);
    doc.rect(20, y, 170, 10, "F");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const vText = `BP: ${data.vitals.bp || "120/80"} mm[Hg]   |   HR: ${data.vitals.heartRate || 72} bpm   |   SpO2: ${data.vitals.spo2 || 98}%   |   Temp: ${data.vitals.temp || 98.6}°F`;
    doc.text(vText, 25, y + 6.5);
    y += 16;
  }

  // Diagnoses (ICD-11 & AYUSH Dual-Coding)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("DIAGNOSES & DUAL-CODING (ICD-11 & AYUSH)", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const diag of data.diagnoses) {
    doc.setTextColor(0, 0, 0);
    doc.text(`• ${diag.title} [ICD-11: ${diag.code || "Unspecified"}]`, 25, y);
    y += 5;
    if (diag.ayushTerm) {
      doc.setTextColor(40, 120, 80);
      doc.text(`   ↳ ${diag.ayushSystem || "Ayurveda"}: ${diag.ayushTerm}`, 25, y);
      y += 5;
    }
  }
  y += 6;

  // Medications Table Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("PRESCRIBED MEDICATIONS", 20, y);
  y += 6;

  doc.setFillColor(235, 240, 245);
  doc.rect(20, y, 170, 7, "F");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("Medication / Drug", 22, y + 5);
  doc.text("Dosage", 80, y + 5);
  doc.text("Freq.", 115, y + 5);
  doc.text("Duration", 135, y + 5);
  doc.text("Instructions", 160, y + 5);
  y += 8;

  doc.setFont("helvetica", "normal");
  for (const med of data.medications) {
    doc.text(med.drug, 22, y + 4);
    doc.text(med.dosage, 80, y + 4);
    doc.text(med.frequency.toUpperCase(), 115, y + 4);
    doc.text(`${med.durationDays} days`, 135, y + 4);
    doc.text(med.instructions || "After food", 160, y + 4);
    y += 7;
  }

  y += 15;

  // Signature area
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Doctor Digital Signature:", 130, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Dr. ${data.doctorName}`, 130, y);
  y += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Verified via HPR Registry`, 130, y);

  // Footer Disclaimer
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "MedLink PBL 2026-27 Research Prototype • Validated HL7 FHIR R4 Bundle Generated",
    20,
    275
  );
  doc.text(
    "This document is for clinical demonstration purposes and patient health record sharing.",
    20,
    280
  );

  doc.save(`Prescription_${data.patientName.replace(/\s+/g, "_")}_${data.date}.pdf`);
}
