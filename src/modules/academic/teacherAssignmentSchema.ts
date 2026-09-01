import { z } from "zod";

/**
 * راجع DECISIONS.md — فجوة حرجة اكتُشفت بمراجعة أمنية: لا وسيلة سابقة لإسناد
 * معلم لفصل/مادة، ما كان يعطّل دور Teacher بالكامل (كل تحقق RBAC بالحضور
 * والدرجات والجدول يعتمد على وجود TeacherAssignment فعلي).
 */
export const createTeacherAssignmentSchema = z.object({
  teacherUserId: z.string().cuid(),
  classRoomId: z.string().cuid(),
  subjectId: z.string().cuid(),
});
export type CreateTeacherAssignmentInput = z.infer<typeof createTeacherAssignmentSchema>;
