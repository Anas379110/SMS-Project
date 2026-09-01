import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { canAccessStudent } from "@/modules/auth/rbac";
import {
  getStudentAccessInfo,
  isTeacherAssignedToStudent,
} from "@/modules/academic/service";
import { getAttendanceForStudent } from "@/modules/attendance/service";
import type { Role } from "@prisma/client";

type Params = { params: { studentId: string } };

/**
 * GET /api/v1/attendance/student/:studentId
 * نفس منطق RBAC المستخدم بـ /api/v1/students/:id تماماً — مصدر حقيقة واحد
 * (canAccessStudent) حتى لا تتشتت قاعدة "من يصل لبيانات أي طالب" بين Endpoints.
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
      return apiError("FORBIDDEN", "لا صلاحية للوصول لسجل حضور هذا الطالب");
    }
  }

  const records = await getAttendanceForStudent(params.studentId);
  return apiSuccess({ items: records });
}
