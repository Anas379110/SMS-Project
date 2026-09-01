import { z } from "zod";

// راجع docs/requirements/SRS.md (FR-4) — تسجيل حضور فصل كامل دفعة واحدة (Batch)

export const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE"]);

export const markAttendanceSchema = z.object({
  classRoomId: z.string().cuid(),
  date: z.coerce.date(),
  records: z
    .array(
      z.object({
        studentId: z.string().cuid(),
        status: attendanceStatusEnum,
      })
    )
    .min(1, "يجب تسجيل حضور طالب واحد على الأقل"),
});
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
