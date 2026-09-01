import { prisma } from "@/lib/prisma";
import type {
  CreateStudentInput,
  UpdateStudentInput,
  CreateClassRoomInput,
  EnrollStudentInput,
  ListQueryInput,
} from "@/modules/academic/schema";

/**
 * طبقة منطق الأعمال (Business Logic) — راجع CLAUDE.md القسم 8:
 * "Business Logic بـ src/modules/ فقط، لا بمكونات UI ولا بملفات Route مباشرة".
 * ملفات Route (API) تستدعي هذه الدوال فقط بعد تحقق RBAC، ولا تتعامل مع Prisma مباشرة.
 */

export async function listStudents(query: ListQueryInput) {
  const where = query.classRoomId
    ? { enrollments: { some: { classRoomId: query.classRoomId } } }
    : {};

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where: { ...where, status: "active" },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { fullName: "asc" },
      include: { guardian: { include: { user: true } } },
    }),
    prisma.student.count({ where: { ...where, status: "active" } }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

/** يُستخدم من Parent — يعيد فقط أبناء ولي الأمر صاحب الجلسة (لا حاجة فلترة يدوية إضافية بالـ Route) */
export async function listStudentsForGuardian(guardianUserId: string) {
  const guardian = await prisma.guardian.findUnique({ where: { userId: guardianUserId } });
  if (!guardian) return [];

  return prisma.student.findMany({
    where: { guardianId: guardian.id, status: "active" },
    orderBy: { fullName: "asc" },
  });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: { guardian: { include: { user: true } }, enrollments: { include: { classRoom: true } } },
  });
}

/** يُستخدم بالتحقق الأمني: بيانات الوصول اللازمة لتطبيق canAccessStudent (ولي الأمر + حساب الطالب نفسه إن وُجد) */
export async function getStudentAccessInfo(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { guardian: true },
  });
  return {
    guardianUserId: student?.guardian?.userId ?? null,
    ownUserId: student?.userId ?? null,
  };
}

/** يُستخدم بالتحقق الأمني: هل هذا المعلم مسؤول فعلياً عن فصل هذا الطالب؟ */
export async function isTeacherAssignedToStudent(
  teacherUserId: string,
  studentId: string
): Promise<boolean> {
  const count = await prisma.teacherAssignment.count({
    where: {
      teacherUserId,
      classRoom: { enrollments: { some: { studentId } } },
    },
  });
  return count > 0;
}

/**
 * تحقق أمني دفعي (Batch) — يُستخدم بتسجيل الحضور تحديداً حيث يُرسل عدة طلاب
 * بطلب واحد. يتحقق من أمرين معاً:
 * 1) المعلم مسند فعلياً لهذا الفصل بالذات (أي مادة).
 * 2) **كل** طالب بالقائمة مسجّل فعلياً بهذا الفصل — لا يكفي التحقق من طالب واحد
 *    فقط (ثغرة كانت موجودة سابقاً: التحقق من أول طالب فقط كان يسمح نظرياً
 *    بحقن studentId لطالب من فصل آخر ضمن نفس الطلب دون رفضه).
 */
export async function validateTeacherBatchForClassRoom(params: {
  teacherUserId: string;
  classRoomId: string;
  studentIds: string[];
}): Promise<boolean> {
  const { teacherUserId, classRoomId, studentIds } = params;
  if (studentIds.length === 0) return false;

  const isAssignedToClass = await prisma.teacherAssignment.count({
    where: { teacherUserId, classRoomId },
  });
  if (isAssignedToClass === 0) return false;

  const enrolledCount = await prisma.enrollment.count({
    where: { classRoomId, studentId: { in: studentIds } },
  });

  // إن لم يكن عدد الطلاب المسجّلين فعلياً بهذا الفصل مطابقاً لعدد الطلاب
  // المُرسلين بالطلب، فهذا يعني وجود studentId واحد على الأقل خارج نطاق
  // هذا الفصل — نرفض الطلب بالكامل، لا نُنفّذ تسجيلاً جزئياً صامتاً.
  const uniqueStudentIds = new Set(studentIds);
  return enrolledCount === uniqueStudentIds.size;
}

export async function createStudent(input: CreateStudentInput) {
  return prisma.student.create({ data: input });
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  return prisma.student.update({ where: { id }, data: input });
}

/** أرشفة لا حذف فعلي — راجع CLAUDE.md القسم 14 (Forbidden Practices) */
export async function archiveStudent(id: string) {
  return prisma.student.update({ where: { id }, data: { status: "archived" } });
}

export async function listClassRooms() {
  return prisma.classRoom.findMany({ orderBy: { name: "asc" } });
}

export async function getClassRoomWithStudents(classRoomId: string) {
  const classRoom = await prisma.classRoom.findUnique({ where: { id: classRoomId } });
  if (!classRoom) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { classRoomId },
    include: { student: true },
    orderBy: { student: { fullName: "asc" } },
  });

  return { classRoom, students: enrollments.map((e) => e.student) };
}

/** الطلاب النشطون غير المسجّلين بعد بهذا الفصل — لواجهة "تسجيل طالب بالفصل" */
export async function getUnenrolledStudents(classRoomId: string) {
  return prisma.student.findMany({
    where: {
      status: "active",
      enrollments: { none: { classRoomId } },
    },
    orderBy: { fullName: "asc" },
  });
}

export async function createClassRoom(input: CreateClassRoomInput) {
  return prisma.classRoom.create({ data: input });
}

export async function enrollStudent(input: EnrollStudentInput) {
  return prisma.enrollment.create({ data: input });
}

/** قائمة حسابات المعلمين — تُستخدم بواجهة إسناد معلم لفصل/مادة (Admin فقط) */
export async function listTeachers() {
  return prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, email: true },
  });
}

/** إسناد معلم لتدريس مادة معينة بفصل معين — راجع DECISIONS.md (فجوة حرجة صُححت) */
export async function createTeacherAssignment(input: {
  teacherUserId: string;
  classRoomId: string;
  subjectId: string;
}) {
  return prisma.teacherAssignment.create({ data: input });
}

export async function getTeacherAssignmentsForClassRoom(classRoomId: string) {
  return prisma.teacherAssignment.findMany({
    where: { classRoomId },
    include: { teacher: { select: { id: true, fullName: true } }, subject: true },
  });
}
