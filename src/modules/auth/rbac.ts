import type { Role } from "@prisma/client";

/**
 * راجع CLAUDE.md القسم 10: كل Endpoint يتحقق من الدور فعلياً بالـ Backend، لا بإخفاء
 * عناصر الواجهة فقط. هذه الدالة نقطة الحقيقة الوحيدة لفحص الصلاحيات — لا تُكرَّر
 * منطق التحقق يدوياً بكل Route.
 */
export function hasRole(userRole: Role | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

/**
 * يمنع أي دور غير الأدمن أو المحاسب من الوصول لبيانات مالية عامة،
 * ويمنع ولي الأمر من الوصول لبيانات طالب ليس ابنه (تُستدعى هذه الدالة
 * بكل Endpoint يعيد بيانات طالب — راجع security-reviewer Agent).
 */
export function canAccessStudent(params: {
  requesterRole: Role;
  requesterUserId: string;
  studentGuardianUserId: string | null;
  isTeacherOfStudent?: boolean;
  studentOwnUserId?: string | null;
}): boolean {
  const {
    requesterRole,
    requesterUserId,
    studentGuardianUserId,
    isTeacherOfStudent,
    studentOwnUserId,
  } = params;

  if (requesterRole === "ADMIN" || requesterRole === "ACCOUNTANT") return true;
  if (requesterRole === "TEACHER") return Boolean(isTeacherOfStudent);
  if (requesterRole === "PARENT") return studentGuardianUserId === requesterUserId;
  if (requesterRole === "STUDENT") return studentOwnUserId === requesterUserId;
  return false;
}
