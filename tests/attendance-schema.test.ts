import { describe, it, expect } from "vitest";
import { markAttendanceSchema } from "@/modules/attendance/schema";

describe("attendance/schema", () => {
  it("accepts a valid batch attendance payload", () => {
    const result = markAttendanceSchema.safeParse({
      classRoomId: "clx0000000000000000000001",
      date: "2026-08-17",
      records: [
        { studentId: "clx0000000000000000000002", status: "PRESENT" },
        { studentId: "clx0000000000000000000003", status: "ABSENT" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty records array (must mark at least one student)", () => {
    const result = markAttendanceSchema.safeParse({
      classRoomId: "clx0000000000000000000001",
      date: "2026-08-17",
      records: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid attendance status value", () => {
    const result = markAttendanceSchema.safeParse({
      classRoomId: "clx0000000000000000000001",
      date: "2026-08-17",
      records: [{ studentId: "clx0000000000000000000002", status: "MAYBE" }],
    });
    expect(result.success).toBe(false);
  });
});
