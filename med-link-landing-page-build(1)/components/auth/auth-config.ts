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

export function maskId(id: string) {
  const clean = id.trim();
  const tail = clean.slice(-3);
  return `${"•".repeat(Math.min(6, Math.max(0, clean.length - 3)))}${tail}`;
}

export function validateIdentifier(role: AuthRole, value: string, { required = true } = {}) {
  const v = value.trim();
  if (!v) return required ? "Enter your ID to continue." : undefined;
  if (role === "patient") {
    const digits = v.replace(/[\s-]/g, "");
    if (!/^\d+$/.test(digits) || (digits.length !== 10 && digits.length !== 14)) {
      return "Enter a 10-digit mobile or 14-digit ABHA number.";
    }
    return undefined;
  }
  if (v.length < 4 || !/^[A-Za-z0-9\-/._ ]+$/.test(v)) return "Enter a valid HPR ID or registration number.";
  return undefined;
}
