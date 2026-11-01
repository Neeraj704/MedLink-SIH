export async function hashOtp(
  otp: string,
  pepper: string,
  challengeId: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${otp}${pepper}${challengeId}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyOtpHash(
  inputOtp: string,
  pepper: string,
  challengeId: string,
  storedHash: string,
  isDemoMode = false,
  demoOtp = "587315"
): Promise<boolean> {
  if (isDemoMode && inputOtp === demoOtp) {
    return true;
  }

  const computed = await hashOtp(inputOtp, pepper, challengeId);
  return timingSafeEqual(computed, storedHash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateOtp(): string {
  const buf = new Uint8Array(3);
  crypto.getRandomValues(buf);
  const num = ((buf[0] << 16) | (buf[1] << 8) | buf[2]) % 900000 + 100000;
  return num.toString();
}

export function maskTarget(identifier: string): string {
  const cleaned = identifier.trim();
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 2)}*** ***${cleaned.slice(-2)}`;
  }
  if (cleaned.startsWith("HPR-")) {
    return `HPR-****-${cleaned.slice(-4)}`;
  }
  if (cleaned.includes("@")) {
    const [name, domain] = cleaned.split("@");
    const maskedName = name.length > 2 ? `${name.slice(0, 2)}***` : `${name}***`;
    return `${maskedName}@${domain}`;
  }
  if (/^\d{14}$/.test(cleaned.replace(/\D/g, ""))) {
    const raw = cleaned.replace(/\D/g, "");
    return `${raw.slice(0, 2)}-****-****-${raw.slice(-4)}`;
  }
  if (cleaned.length > 4) {
    return `${cleaned.slice(0, 2)}***${cleaned.slice(-2)}`;
  }
  return "****";
}
