import { prisma } from "@/lib/prisma";
import type { CreateGradeInput, CreateSubjectInput } from "@/modules/grades/schema";

// راجع docs/requirements/SRS.md (FR-5, FR-8.1) و CLAUDE.md القسم 8

export async function createGrade(input: CreateGradeInput) {
  const grade = await prisma.grade.create({ data: input, include: { subject: true } });

  // راجع DECISIONS.md — FR-8.1 يتطلب إشعاراً عند رصد درجة جديدة، كان مفقوداً
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { guardian: true },
  });

  if (student?.guardian?.userId) {
    await prisma.notification.create({
      data: {
        userId: student.guardian.userId,
        type: "NEW_GRADE",
        message: `درجة جديدة لـ ${student.fullName} بمادة ${grade.subject.name}: ${grade.score}`,
      },
    });
  }

  return grade;
}

export async function getGradesForStudent(studentId: string) {
  return prisma.grade.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listSubjects() {
  return prisma.subject.findMany({ orderBy: { name: "asc" } });
}

export async function createSubject(input: CreateSubjectInput) {
  return prisma.subject.create({ data: input });
}

/**
 * تحقق أمني: هل هذا المعلم مسؤول فعلياً عن تدريس هذه المادة لهذا الطالب تحديداً؟
 * أدق من isTeacherAssignedToStudent العام (وحدة Academic) لأنه يتحقق من المادة أيضاً،
 * لا فقط الفصل — معلم الرياضيات لا يجب أن يرصد درجة لمادة اللغة الإنجليزية.
 */
export async function isTeacherAssignedToStudentSubject(
  teacherUserId: string,
  studentId: string,
  subjectId: string
): Promise<boolean> {
  const count = await prisma.teacherAssignment.count({
    where: {
      teacherUserId,
      subjectId,
      classRoom: { enrollments: { some: { studentId } } },
    },
  });
  return count > 0;
}
