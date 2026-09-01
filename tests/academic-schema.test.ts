import { describe, it, expect } from "vitest";
import {
  createStudentSchema,
  createClassRoomSchema,
  listQuerySchema,
} from "@/modules/academic/schema";

describe("academic/schema", () => {
  it("createStudentSchema accepts a valid minimal student", () => {
    const result = createStudentSchema.safeParse({ fullName: "أحمد محمد" });
    expect(result.success).toBe(true);
  });

  it("createStudentSchema rejects an empty name", () => {
    const result = createStudentSchema.safeParse({ fullName: "" });
    expect(result.success).toBe(false);
  });

  it("createClassRoomSchema requires both name and academicYear", () => {
    expect(createClassRoomSchema.safeParse({ name: "1A" }).success).toBe(false);
    expect(
      createClassRoomSchema.safeParse({ name: "1A", academicYear: "2026-2027" }).success
    ).toBe(true);
  });

  it("listQuerySchema applies sensible defaults", () => {
    const result = listQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it("listQuerySchema rejects a limit above the maximum allowed", () => {
    const result = listQuerySchema.safeParse({ limit: 500 });
    expect(result.success).toBe(false);
  });
});
