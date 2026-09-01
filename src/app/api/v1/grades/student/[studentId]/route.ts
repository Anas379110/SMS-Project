import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { canAccessStudent } from "@/modules/auth/rbac";
import { getStudentAccessInfo, isTeacherAssignedToStudent } from "@/modules/academic/service";
import { getGradesForStudent } from "@/modules/grades/service";
import type { Role } from "@prisma/client";

type Params = { params: { studentId: string } };

/**
 * GET /api/v1/grades/student/:studentId
 * نفس منطق RBAC الموحّد (canAccessStudent) المستخدم بكل Endpoint يعيد بيانات طالب.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const role = session.user.role as Role;
  const userId = session.user.id;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    const { guardianUserId, ownUserId } = await getStudentAccessInfo(params.studentId);
    const isTeacherOfStudent =
      role === "TEACHER" ? await isTeacherAssignedToStudent(userId, params.studentId) : false;

    const allowed = canAccessStudent({
      requesterRole: role,
      requesterUserId: userId,
      studentGuardianUserId: guardianUserId,
      isTeacherOfStudent,
      studentOwnUserId: ownUserId,
    });

    if (!allowed) {
      return apiError("FORBIDDEN", "لا صلاحية للوصول لدرجات هذا الطالب");
    }
  }

  const grades = await getGradesForStudent(params.studentId);
  return apiSuccess({ items: grades });
}
