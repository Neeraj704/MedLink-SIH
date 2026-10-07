export type AuthRole = "patient" | "doctor";

export const ROLES: AuthRole[] = ["patient", "doctor"];

export const ROLE_CONFIG: Record<
  AuthRole,
  { label: string; idLabel: string; idPlaceholder: string; idHint: string; signinHint: string }
> = {
  patient: {
    label: "Patient",
    idLabel: "ABHA number or mobile",
    idPlaceholder: "14-digit ABHA or 10-digit mobile",
    idHint: "Don't have an ABHA yet? You can create one later.",
    signinHint: "We'll send a one-time code to the mobile linked to this ID.",
  },
  doctor: {
    label: "Doctor",
    idLabel: "HPR ID or registration number",
    idPlaceholder: "e.g. HPR-1234-5678",
    idHint: "Your Healthcare Professionals Registry ID or council registration number.",
    signinHint: "We'll send a one-time code to your registered mobile.",
  },
};

export const LANGUAGES = [
  "English",
  "हिन्दी (Hindi)",
  "বাংলা (Bengali)",
  "தமிழ் (Tamil)",
  "తెలుగు (Telugu)",
  "मराठी (Marathi)",
  "ગુજરાતી (Gujarati)",
  "اردو (Urdu)",
];

export function parseRole(value: string | string[] | undefined): AuthRole {
  return value === "doctor" ? "doctor" : "patient";
}


export function formatAbha(digits: string): string {
  const d = digits.slice(0, 14);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 6));
  if (d.length > 6) parts.push(d.slice(6, 10));
  if (d.length > 10) parts.push(d.slice(10, 14));
  return parts.join("-");
}

export function formatMobile(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5, 10)}`;
}

export function formatHpr(val: string): string {
  const clean = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (clean.startsWith("HPR")) {
    const rest = clean.slice(3);
    const parts = ["HPR"];
    if (rest.length > 0) parts.push(rest.slice(0, 4));
    if (rest.length > 4) parts.push(rest.slice(4, 8));
    if (rest.length > 8) parts.push(rest.slice(8, 12));
    return parts.join("-");
  }
  return val.toUpperCase();
}

export function formatName(val: string): string {
  // Title-case capitalization for names while preserving in-progress typing
  return val
    .replace(/[^a-zA-Z\s.'-]/g, "")
    .replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}

export interface InputDetection {
  kind: "mobile" | "abha" | "abha_address" | "hpr" | "council" | "unknown";
  label: string;
  formatted: string;
  raw: string;
  isValid: boolean;
  countText?: string;
  hint: string;
  method: "mobile" | "abha" | "hpr";
}

export function detectPatientIdentifier(input: string): InputDetection {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      kind: "unknown",
      label: "",
      formatted: "",
      raw: "",
      isValid: false,
      hint: "",
      method: "abha",
    };
  }

  // ABHA Address with @
  if (trimmed.includes("@")) {
    const isValid = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9.-]{2,}$/.test(trimmed);
    return {
      kind: "abha_address",
      label: "ABHA Address",
      formatted: trimmed.toLowerCase(),
      raw: trimmed.toLowerCase(),
      isValid,
      hint: isValid ? "Valid ABHA address" : "e.g. name@abdm",
      method: "abha",
    };
  }

  // Letter input without @ -> prospective ABHA address
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      kind: "abha_address",
      label: "ABHA Address",
      formatted: trimmed.toLowerCase(),
      raw: trimmed.toLowerCase(),
      isValid: false,
      hint: "Add domain (e.g. @abdm)",
      method: "abha",
    };
  }

  const digits = trimmed.replace(/\D/g, "");
  const startsWithMobilePrefix = /^[6-9]/.test(digits);

  // If starts with 6-9 and length <= 10 -> Mobile
  if (startsWithMobilePrefix && digits.length <= 10) {
    const formatted = formatMobile(digits);
    const isValid = digits.length === 10;
    return {
      kind: "mobile",
      label: "Mobile Number",
      formatted,
      raw: digits,
      isValid,
      countText: `${digits.length}/10`,
      hint: isValid ? "Valid 10-digit mobile" : "10-digit mobile number",
      method: "mobile",
    };
  }

  // 14-digit ABHA (starts with 1-5, or more than 10 digits)
  const clamped = digits.slice(0, 14);
  const formatted = formatAbha(clamped);
  const isValid = digits.length === 14;
  return {
    kind: "abha",
    label: "ABHA Number",
    formatted,
    raw: clamped,
    isValid,
    countText: `${Math.min(digits.length, 14)}/14`,
    hint: isValid ? "Valid 14-digit ABHA" : digits.length > 14 ? "ABHA cannot exceed 14 digits" : "14-digit ABHA number",
    method: "abha",
  };
}

export function detectDoctorIdentifier(input: string): InputDetection {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      kind: "unknown",
      label: "",
      formatted: "",
      raw: "",
      isValid: false,
      hint: "",
      method: "hpr",
    };
  }

  const upper = trimmed.toUpperCase();
  if (upper.startsWith("HPR") || upper.startsWith("HP")) {
    const formatted = formatHpr(trimmed);
    const parts = formatted.split("-");
    const digitsOrChars = parts.slice(1).join("");
    const isValid = parts.length >= 3 && digitsOrChars.length >= 8;
    return {
      kind: "hpr",
      label: "HPR ID",
      formatted,
      raw: formatted,
      isValid,
      hint: isValid ? "Valid HPR ID" : "e.g. HPR-1234-5678",
      method: "hpr",
    };
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    const cleaned = trimmed.toUpperCase().replace(/\s+/g, "-");
    const isValid = cleaned.length >= 4;
    return {
      kind: "council",
      label: "Council Reg.",
      formatted: cleaned,
      raw: cleaned,
      isValid,
      hint: isValid ? "Valid Registration" : "e.g. MCI-2023-89012",
      method: "hpr",
    };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (/^[6-9]/.test(digits) && digits.length <= 10) {
    const formatted = formatMobile(digits);
    const isValid = digits.length === 10;
    return {
      kind: "mobile",
      label: "Registered Mobile",
      formatted,
      raw: digits,
      isValid,
      countText: `${digits.length}/10`,
      hint: isValid ? "Valid 10-digit mobile" : "10-digit mobile",
      method: "mobile",
    };
  }

  const clamped = digits.slice(0, 14);
  const formatted = formatAbha(clamped);
  const isValid = digits.length === 14;
  return {
    kind: "hpr",
    label: "14-digit HPR ID",
    formatted,
    raw: clamped,
    isValid,
    countText: `${Math.min(digits.length, 14)}/14`,
    hint: isValid ? "Valid 14-digit HPR" : digits.length > 14 ? "HPR cannot exceed 14 digits" : "14-digit HPR number",
    method: "hpr",
  };
}

export function detectIdentifier(role: AuthRole, value: string): InputDetection {
  return role === "doctor" ? detectDoctorIdentifier(value) : detectPatientIdentifier(value);
}

export function maskId(id: string) {
  const clean = id.trim();
  const digits = clean.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ••••• ••${digits.slice(-3)}`;
  }
  if (digits.length === 14) {
    return `••-••••-••••-${digits.slice(-4)}`;
  }
  if (clean.toUpperCase().startsWith("HPR")) {
    const last4 = clean.slice(-4);
    return `HPR-••••-${last4}`;
  }
  const tail = clean.slice(-3);
  return `${"•".repeat(Math.min(6, Math.max(0, clean.length - 3)))}${tail}`;
}

export function validateIdentifier(role: AuthRole, value: string, { required = true } = {}) {
  const v = value.trim();
  if (!v) return required ? "Enter your ID to continue." : undefined;
  const detection = detectIdentifier(role, v);
  if (detection.isValid) return undefined;

  if (role === "patient") {
    if (detection.kind === "mobile") {
      return "Enter a valid 10-digit mobile number starting with 6-9.";
    }
    if (detection.kind === "abha_address") {
      return "Enter a valid ABHA address (e.g. username@abdm).";
    }
    return "Enter a valid 10-digit mobile or 14-digit ABHA number.";
  }

  if (detection.kind === "mobile") {
    return "Enter a valid 10-digit registered mobile number.";
  }
  if (detection.kind === "hpr") {
    return "Enter a valid HPR ID (e.g. HPR-1234-5678 or 14 digits).";
  }
  return "Enter a valid HPR ID or registration number.";
}
