import { describe, it, expect } from "vitest";
import { createScheduleEntrySchema } from "@/modules/schedule/schema";

describe("schedule/schema", () => {
  const base = {
    classRoomId: "clx0000000000000000000001",
    subjectId: "clx0000000000000000000002",
    dayOfWeek: "SUNDAY" as const,
  };

  it("accepts a valid schedule entry", () => {
    const result = createScheduleEntrySchema.safeParse({
      ...base,
      startTime: "08:00",
      endTime: "08:45",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid time format", () => {
    const result = createScheduleEntrySchema.safeParse({
      ...base,
      startTime: "8am",
      endTime: "08:45",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when start time is after end time", () => {
    const result = createScheduleEntrySchema.safeParse({
      ...base,
      startTime: "09:00",
      endTime: "08:45",
    });
    expect(result.success).toBe(false);
  });
});
