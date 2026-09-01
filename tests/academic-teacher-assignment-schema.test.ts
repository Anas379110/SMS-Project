import { describe, it, expect } from "vitest";
import { createTeacherAssignmentSchema } from "@/modules/academic/teacherAssignmentSchema";

describe("academic/teacherAssignmentSchema", () => {
  it("accepts a valid assignment payload", () => {
    const result = createTeacherAssignmentSchema.safeParse({
      teacherUserId: "clx0000000000000000000001",
      classRoomId: "clx0000000000000000000002",
      subjectId: "clx0000000000000000000003",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing subjectId", () => {
    const result = createTeacherAssignmentSchema.safeParse({
      teacherUserId: "clx0000000000000000000001",
      classRoomId: "clx0000000000000000000002",
    });
    expect(result.success).toBe(false);
  });
});
