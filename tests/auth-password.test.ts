import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

describe("auth/password", () => {
  it("hashes a password and verifies it correctly", async () => {
    const plain = "SuperSecret123!";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(await verifyPassword(plain, hash)).toBe(true);
  });

  it("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("CorrectPassword1");
    expect(await verifyPassword("WrongPassword1", hash)).toBe(false);
  });
});
