import { describe, it, expect, vi } from "vitest";
import {
  isAccountLocked,
  computeFailedLoginUpdate,
} from "@/modules/auth/bruteForceProtection";

/**
 * راجع DECISIONS.md — مراجعة أمنية اكتشفت غياب أي حد لمحاولات الدخول الفاشلة
 * (خطر Brute Force غير محدود). هذا الاختبار يحمي منطق الإصلاح.
 */
describe("auth/bruteForceProtection", () => {
  it("isAccountLocked returns false when lockedUntil is null", () => {
    expect(isAccountLocked(null)).toBe(false);
  });

  it("isAccountLocked returns true while lock timestamp is still in the future", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isAccountLocked(future)).toBe(true);
  });

  it("isAccountLocked returns false once the lock timestamp has passed", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isAccountLocked(past)).toBe(false);
  });

  it("computeFailedLoginUpdate increments the counter without locking below the threshold", () => {
    const result = computeFailedLoginUpdate(2);
    expect(result.failedLoginAttempts).toBe(3);
    expect(result.lockedUntil).toBeNull();
  });

  it("computeFailedLoginUpdate locks the account once the 5th failed attempt is reached", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-19T10:00:00Z"));

    const result = computeFailedLoginUpdate(4);

    expect(result.failedLoginAttempts).toBe(5);
    expect(result.lockedUntil).not.toBeNull();
    expect(result.lockedUntil!.getTime()).toBe(
      new Date("2026-08-19T10:15:00Z").getTime()
    );

    vi.useRealTimers();
  });

  it("computeFailedLoginUpdate keeps locking (extends) on further attempts beyond the threshold", () => {
    const result = computeFailedLoginUpdate(7);
    expect(result.failedLoginAttempts).toBe(8);
    expect(result.lockedUntil).not.toBeNull();
  });
});
