import { prisma } from "@/lib/prisma";
import type { CreateScheduleEntryInput } from "@/modules/schedule/schema";

export async function createScheduleEntry(input: CreateScheduleEntryInput) {
  return prisma.scheduleEntry.create({ data: input });
}

const DAY_ORDER = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export async function getScheduleForClassRoom(classRoomId: string) {
  const entries = await prisma.scheduleEntry.findMany({
    where: { classRoomId },
    include: { subject: true },
  });

  // فرز حسب ترتيب أيام الأسبوع الطبيعي ثم وقت البداية — راجع docs/design/UI-UX.md
  return entries.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
}

/** تحقق أمني: هل الطالب (عبر ولي أمره أو نفسه) أو المعلم مرتبط فعلياً بهذا الفصل؟ */
export async function isUserRelatedToClassRoom(params: {
  role: string;
  userId: string;
  classRoomId: string;
}): Promise<boolean> {
  const { role, userId, classRoomId } = params;

  if (role === "TEACHER") {
    const count = await prisma.teacherAssignment.count({
      where: { teacherUserId: userId, classRoomId },
    });
    return count > 0;
  }

  if (role === "PARENT") {
    const count = await prisma.enrollment.count({
      where: {
        classRoomId,
        student: { guardian: { userId } },
      },
    });
    return count > 0;
  }

  if (role === "STUDENT") {
    const count = await prisma.enrollment.count({
      where: { classRoomId, student: { userId } },
    });
    return count > 0;
  }

  return false;
}
