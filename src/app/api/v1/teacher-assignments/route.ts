import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createTeacherAssignmentSchema } from "@/modules/academic/teacherAssignmentSchema";
import { createTeacherAssignment } from "@/modules/academic/service";

/**
 * POST /api/v1/teacher-assignments — Admin فقط.
 * راجع DECISIONS.md: بدون هذا الـEndpoint، دور Teacher بالكامل كان معطّلاً
 * فعلياً (كل RBAC بالحضور/الدرجات/الجدول يعتمد على وجود هذا الإسناد).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإسناد معلم");
  }

  const body = await request.json().catch(() => null);
  const parsed = createTeacherAssignmentSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الإسناد غير صحيحة");

  try {
    const assignment = await createTeacherAssignment(parsed.data);
    return apiSuccess(assignment, 201);
  } catch {
    return apiError("CONFLICT", "هذا المعلم مُسند مسبقاً لهذه المادة بهذا الفصل");
  }
}
