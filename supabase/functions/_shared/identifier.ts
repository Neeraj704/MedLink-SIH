export type DetectedIdentifier =
  | { kind: "mobile"; value: string }
  | { kind: "abha"; value: string }
  | { kind: "abha_address"; value: string }
  | { kind: "hpr"; value: string }
  | { kind: "council"; value: string }
  | { kind: "unknown"; value: string };

export function resolveIdentifier(
  role: "doctor" | "patient",
  input: string
): DetectedIdentifier {
  const trimmed = input.trim();
  if (!trimmed) {
    return { kind: "unknown", value: "" };
  }

  if (role === "patient") {
    if (trimmed.includes("@")) {
      return { kind: "abha_address", value: trimmed.toLowerCase() };
    }
    const digits = trimmed.replace(/\D/g, "");
    if (/^[6-9]\d{9}$/.test(digits)) {
      return { kind: "mobile", value: digits };
    }
    if (digits.length === 14) {
      return { kind: "abha", value: digits };
    }
    return { kind: "unknown", value: trimmed };
  }

  // Doctor role
  const upper = trimmed.toUpperCase();
  if (upper.startsWith("HPR")) {
    const clean = upper.replace(/[^A-Z0-9]/g, "");
    const rest = clean.slice(3);
    const parts = ["HPR"];
    if (rest.length > 0) parts.push(rest.slice(0, 4));
    if (rest.length > 4) parts.push(rest.slice(4, 8));
    return { kind: "hpr", value: parts.join("-") };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) {
    return { kind: "mobile", value: digits };
  }

  if (trimmed.length >= 4) {
    return { kind: "council", value: trimmed.toUpperCase().replace(/\s+/g, "-") };
  }

  return { kind: "unknown", value: trimmed };
}
