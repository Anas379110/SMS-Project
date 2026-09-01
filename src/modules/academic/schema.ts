import { z } from "zod";

// راجع docs/requirements/SRS.md (FR-3) و CLAUDE.md القسم 6/8

export const createStudentSchema = z.object({
  fullName: z.string().min(2).max(200),
  birthDate: z.coerce.date().optional(),
  guardianId: z.string().cuid().optional(),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const createClassRoomSchema = z.object({
  name: z.string().min(1).max(100),
  academicYear: z.string().min(4).max(20),
});
export type CreateClassRoomInput = z.infer<typeof createClassRoomSchema>;

export const enrollStudentSchema = z.object({
  studentId: z.string().cuid(),
  classRoomId: z.string().cuid(),
});
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  classRoomId: z.string().cuid().optional(),
});
export type ListQueryInput = z.infer<typeof listQuerySchema>;
