import { describe, it, expect } from "vitest";
import {
  generateResetToken,
  hashResetToken,
  isResetTokenExpired,
} from "@/modules/auth/passwordReset";

describe("auth/passwordReset", () => {
  it("generateResetToken produces a token whose hash matches hashResetToken", () => {
    const { token, tokenHash } = generateResetToken();
    expect(hashResetToken(token)).toBe(tokenHash);
  });

  it("generateResetToken produces an expiry roughly 60 minutes in the future", () => {
    const before = Date.now();
    const { expiresAt } = generateResetToken();
    const diffMinutes = (expiresAt.getTime() - before) / 60000;
    expect(diffMinutes).toBeGreaterThan(59);
    expect(diffMinutes).toBeLessThanOrEqual(60);
  });

  it("generateResetToken never reuses the same token across calls (sufficient entropy)", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it("isResetTokenExpired treats a null expiry as expired (fail-safe default)", () => {
    expect(isResetTokenExpired(null)).toBe(true);
  });

  it("isResetTokenExpired correctly distinguishes past and future timestamps", () => {
    expect(isResetTokenExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isResetTokenExpired(new Date(Date.now() + 1000))).toBe(false);
  });

  it("hashResetToken is deterministic (same input always produces same hash)", () => {
    const token = "a".repeat(64);
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });
});
