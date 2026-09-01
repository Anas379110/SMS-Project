import { z } from "zod";

// راجع docs/requirements/SRS.md (FR-6) — عرض فقط بهذا الإصدار، بدون محرك جدولة آلي (راجع SCOPE.md)

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM

export const dayOfWeekEnum = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

export const createScheduleEntrySchema = z
  .object({
    classRoomId: z.string().cuid(),
    subjectId: z.string().cuid(),
    dayOfWeek: dayOfWeekEnum,
    startTime: z.string().regex(timeRegex, "صيغة الوقت غير صحيحة (HH:MM)"),
    endTime: z.string().regex(timeRegex, "صيغة الوقت غير صحيحة (HH:MM)"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "وقت البداية يجب أن يكون قبل وقت النهاية",
    path: ["endTime"],
  });
export type CreateScheduleEntryInput = z.infer<typeof createScheduleEntrySchema>;
