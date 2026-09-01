import { describe, it, expect } from "vitest";
import { createGradeSchema } from "@/modules/grades/schema";

describe("grades/schema", () => {
  it("accepts a valid grade between 0 and 100", () => {
    const result = createGradeSchema.safeParse({
      studentId: "clx0000000000000000000001",
      subjectId: "clx0000000000000000000002",
      score: 87.5,
      term: "الفصل الأول 2026",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a score above 100", () => {
    const result = createGradeSchema.safeParse({
      studentId: "clx0000000000000000000001",
      subjectId: "clx0000000000000000000002",
      score: 150,
      term: "الفصل الأول 2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative score", () => {
    const result = createGradeSchema.safeParse({
      studentId: "clx0000000000000000000001",
      subjectId: "clx0000000000000000000002",
      score: -5,
      term: "الفصل الأول 2026",
    });
    expect(result.success).toBe(false);
  });
});
