import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createGradeSchema } from "@/modules/grades/schema";
import { createGrade, isTeacherAssignedToStudentSubject } from "@/modules/grades/service";

/**
 * POST /api/v1/grades — راجع docs/api/API.md
 * الدور: Teacher فقط، وبتحقق دقيق أنه معلم هذه المادة تحديداً لهذا الطالب
 * (لا يكفي أن يكون معلماً بالفصل — يجب أن يكون معلم المادة نفسها).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["TEACHER"])) {
    return apiError("FORBIDDEN", "لا صلاحية لرصد الدرجات");
  }

  const body = await request.json().catch(() => null);
  const parsed = createGradeSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الدرجة غير صحيحة");

  const isAssigned = await isTeacherAssignedToStudentSubject(
    session.user.id,
    parsed.data.studentId,
    parsed.data.subjectId
  );
  if (!isAssigned) {
    return apiError("FORBIDDEN", "لست معلم هذه المادة لهذا الطالب");
  }

  const grade = await createGrade(parsed.data);
  return apiSuccess(grade, 201);
}
