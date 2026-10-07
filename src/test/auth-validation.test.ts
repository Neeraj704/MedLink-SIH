import { describe, it, expect } from "vitest";
import {
  detectPatientIdentifier,
  detectDoctorIdentifier,
  formatAbha,
  formatMobile,
  formatHpr,
  formatName,
  maskId,
  validateIdentifier,
} from "@/components/auth/auth-config";

describe("Auth Smart Input Recognition & Validation", () => {
  describe("formatAbha", () => {
    it("formats 14 digits with hyphens into XX-XXXX-XXXX-XXXX", () => {
      expect(formatAbha("91884219203341")).toBe("91-8842-1920-3341");
      expect(formatAbha("12345678901234")).toBe("12-3456-7890-1234");
    });

    it("clamps at 14 digits", () => {
      expect(formatAbha("91884219203341999999")).toBe("91-8842-1920-3341");
    });
  });

  describe("formatMobile", () => {
    it("formats 10 digits as 5 and 5", () => {
      expect(formatMobile("9876543210")).toBe("98765 43210");
    });

    it("clamps at 10 digits", () => {
      expect(formatMobile("9876543210999")).toBe("98765 43210");
    });
  });

  describe("formatHpr", () => {
    it("formats HPR identifiers with hyphens", () => {
      expect(formatHpr("HPR12345678")).toBe("HPR-1234-5678");
    });
  });

  describe("formatName", () => {
    it("capitalizes words properly", () => {
      expect(formatName("ananya sharma")).toBe("Ananya Sharma");
      expect(formatName("dr. ananya sharma")).toBe("Dr. Ananya Sharma");
    });
  });

  describe("detectPatientIdentifier", () => {
    it("detects 10-digit mobile number starting with 6-9", () => {
      const res = detectPatientIdentifier("9876543210");
      expect(res.kind).toBe("mobile");
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe("98765 43210");
      expect(res.method).toBe("mobile");
    });

    it("detects partial mobile number", () => {
      const res = detectPatientIdentifier("98765");
      expect(res.kind).toBe("mobile");
      expect(res.isValid).toBe(false);
      expect(res.countText).toBe("5/10");
    });

    it("detects 14-digit ABHA number starting with non-mobile digit", () => {
      const res = detectPatientIdentifier("12345678901234");
      expect(res.kind).toBe("abha");
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe("12-3456-7890-1234");
      expect(res.method).toBe("abha");
    });

    it("detects 14-digit ABHA number starting with 9 if length > 10", () => {
      const res = detectPatientIdentifier("91884219203341");
      expect(res.kind).toBe("abha");
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe("91-8842-1920-3341");
    });

    it("detects ABHA address with @", () => {
      const res = detectPatientIdentifier("ananya@abdm");
      expect(res.kind).toBe("abha_address");
      expect(res.isValid).toBe(true);
      expect(res.formatted).toBe("ananya@abdm");
    });
  });

  describe("detectDoctorIdentifier", () => {
    it("detects HPR ID", () => {
      const res = detectDoctorIdentifier("HPR-1234-5678");
      expect(res.kind).toBe("hpr");
      expect(res.isValid).toBe(true);
    });

    it("detects Council registration number", () => {
      const res = detectDoctorIdentifier("MCI-2023-89012");
      expect(res.kind).toBe("council");
      expect(res.isValid).toBe(true);
    });

    it("detects 10-digit registered mobile", () => {
      const res = detectDoctorIdentifier("9876543210");
      expect(res.kind).toBe("mobile");
      expect(res.isValid).toBe(true);
    });
  });

  describe("maskId", () => {
    it("masks 10-digit mobile nicely", () => {
      expect(maskId("9876543210")).toBe("+91 ••••• ••210");
    });

    it("masks 14-digit ABHA nicely", () => {
      expect(maskId("91-8842-1920-3341")).toBe("••-••••-••••-3341");
    });

    it("masks HPR ID nicely", () => {
      expect(maskId("HPR-1234-5678")).toBe("HPR-••••-5678");
    });
  });

  describe("validateIdentifier", () => {
    it("validates mobile and abha correctly", () => {
      expect(validateIdentifier("patient", "98765 43210")).toBeUndefined();
      expect(validateIdentifier("patient", "91-8842-1920-3341")).toBeUndefined();
      expect(validateIdentifier("patient", "123123123123123123")).toBeDefined();
    });
  });
});
