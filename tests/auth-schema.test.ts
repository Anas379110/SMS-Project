import { describe, it, expect } from "vitest";
import { loginSchema } from "@/modules/auth/schema";

describe("auth/schema — loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "teacher@school.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "teacher@school.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
