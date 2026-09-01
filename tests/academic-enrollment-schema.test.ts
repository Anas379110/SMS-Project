import { describe, it, expect } from "vitest";
import { enrollStudentSchema } from "@/modules/academic/schema";

describe("academic/schema — enrollStudentSchema", () => {
  it("accepts valid CUIDs for both studentId and classRoomId", () => {
    const result = enrollStudentSchema.safeParse({
      studentId: "clx0000000000000000000001",
      classRoomId: "clx0000000000000000000002",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed id", () => {
    const result = enrollStudentSchema.safeParse({
      studentId: "not-a-cuid",
      classRoomId: "clx0000000000000000000002",
    });
    expect(result.success).toBe(false);
  });
});
