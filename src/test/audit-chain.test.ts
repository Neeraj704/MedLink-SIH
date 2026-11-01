import { describe, it, expect } from "vitest";
import { verifyAuditChain, type AuditLogRow } from "@/hooks/data/useAuditLog";

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("Tamper-Evident Hash Chain Audit Log", () => {
  it("verifies empty or single-entry chains as intact", async () => {
    expect(await verifyAuditChain([])).toBe(true);

    const singleLog: AuditLogRow = {
      id: 1,
      actor_id: "user-1",
      action: "LOGIN",
      entity: "auth",
      meta: {},
      prev_hash: "GENESIS_HASH",
      hash: "abc123hash",
      created_at: new Date().toISOString(),
    };
    expect(await verifyAuditChain([singleLog])).toBe(true);
  });

  it("verifies a sequence of valid chained log records", async () => {
    const time1 = "2026-11-01T10:00:00.000Z";
    const time2 = "2026-11-01T10:05:00.000Z";
    const time3 = "2026-11-01T10:10:00.000Z";

    const hash1 = await sha256(`0000000000000000000000000000000000000000000000000000000000000000:user-1:SIGN_IN:auth:auth-1:${time1}`);
    const hash2 = await sha256(`${hash1}:user-1:SEARCH_DISEASES:disease_mappings:none:${time2}`);
    const hash3 = await sha256(`${hash2}:user-1:PUBLISH_CONSULTATION:consultations:c-1:${time3}`);

    const logs: AuditLogRow[] = [
      {
        id: 1,
        actor_id: "user-1",
        action: "SIGN_IN",
        entity: "auth",
        entity_id: "auth-1",
        meta: {},
        prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: hash1,
        created_at: time1,
      },
      {
        id: 2,
        actor_id: "user-1",
        action: "SEARCH_DISEASES",
        entity: "disease_mappings",
        entity_id: "none",
        meta: {},
        prev_hash: hash1,
        hash: hash2,
        created_at: time2,
      },
      {
        id: 3,
        actor_id: "user-1",
        action: "PUBLISH_CONSULTATION",
        entity: "consultations",
        entity_id: "c-1",
        meta: {},
        prev_hash: hash2,
        hash: hash3,
        created_at: time3,
      },
    ];

    expect(await verifyAuditChain(logs)).toBe(true);
  });

  it("detects tampering when an action or hash is modified", async () => {
    const logs: AuditLogRow[] = [
      {
        id: 1,
        actor_id: "user-1",
        action: "SIGN_IN",
        entity: "auth",
        meta: {},
        prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: "hash_record_1",
        created_at: "2026-11-01T10:00:00.000Z",
      },
      {
        id: 2,
        actor_id: "user-1",
        action: "TAMPERED_ACTION",
        entity: "auth",
        meta: {},
        prev_hash: "broken_pointer_hash",
        hash: "hash_record_2",
        created_at: "2026-11-01T10:05:00.000Z",
      },
    ];

    expect(await verifyAuditChain(logs)).toBe(false);
  });
});
