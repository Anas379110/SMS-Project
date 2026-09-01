import { prisma } from "@/lib/prisma";
import type { MarkAttendanceInput } from "@/modules/attendance/schema";

/**
 * راجع docs/requirements/SRS.md Use Case: "تسجيل حضور الفصل" و
 * CLAUDE.md القسم 8 (Business Logic بـ src/modules/ فقط).
 */

/**
 * يسجل حضور فصل كامل ليوم واحد دفعة واحدة (Batch Upsert — يسمح بتعديل سجل
 * اليوم نفسه لاحقاً، مطابق للـ Alternative Flow بالـ Use Case بـ SRS.md).
 * يُطلق إشعاراً لولي أمر كل طالب غائب (FR-4.3).
 */
export async function markAttendance(input: MarkAttendanceInput) {
  const results = await prisma.$transaction(
    input.records.map((record) =>
      prisma.attendanceRecord.upsert({
        where: {
          studentId_classRoomId_date: {
            studentId: record.studentId,
            classRoomId: input.classRoomId,
            date: input.date,
          },
        },
        update: { status: record.status },
        create: {
          studentId: record.studentId,
          classRoomId: input.classRoomId,
          date: input.date,
          status: record.status,
        },
      })
    )
  );

  // إشعار أولياء أمور الغائبين فقط (FR-4.3) — لا حاجة إشعار عند الحضور الطبيعي
  const absentStudentIds = input.records
    .filter((r) => r.status === "ABSENT")
    .map((r) => r.studentId);

  if (absentStudentIds.length > 0) {
    await notifyGuardiansOfAbsence(absentStudentIds, input.date);
  }

  return results;
}

async function notifyGuardiansOfAbsence(studentIds: string[], date: Date) {
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: { guardian: true },
  });

  const notifications = students
    .filter((s) => s.guardian?.userId)
    .map((s) => ({
      userId: s.guardian!.userId,
      type: "ATTENDANCE_ABSENCE",
      message: `تسجيل غياب لـ ${s.fullName} بتاريخ ${date.toLocaleDateString()}`,
    }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
}

/** يُستخدم بشاشة "تسجيل الحضور" — يعيد طلاب الفصل + سجل اليوم إن وُجد مسبقاً */
export async function getAttendanceSheet(classRoomId: string, date: Date) {
  const [enrollments, existingRecords] = await Promise.all([
    prisma.enrollment.findMany({
      where: { classRoomId },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    }),
    prisma.attendanceRecord.findMany({
      where: { classRoomId, date },
    }),
  ]);

  const recordByStudentId = new Map(existingRecords.map((r) => [r.studentId, r.status]));

  return enrollments.map((e) => ({
    studentId: e.student.id,
    fullName: e.student.fullName,
    // الحالة الافتراضية "حاضر" لكل الطلاب (راجع UI-UX.md — Flow تسجيل الحضور)
    status: recordByStudentId.get(e.student.id) ?? "PRESENT",
  }));
}

/** سجل حضور تراكمي لطالب واحد — راجع FR-4.2 */
export async function getAttendanceForStudent(studentId: string) {
  return prisma.attendanceRecord.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    include: { classRoom: true },
  });
}
