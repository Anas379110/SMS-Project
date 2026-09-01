import { z } from "zod";

// راجع docs/requirements/SRS.md (FR-5)

export const createGradeSchema = z.object({
  studentId: z.string().cuid(),
  subjectId: z.string().cuid(),
  score: z.coerce.number().min(0).max(100),
  term: z.string().min(1).max(50),
});
export type CreateGradeInput = z.infer<typeof createGradeSchema>;

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
