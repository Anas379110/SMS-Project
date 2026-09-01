import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole, canAccessStudent } from "@/modules/auth/rbac";
import { updateStudentSchema } from "@/modules/academic/schema";
import {
  getStudentById,
  getStudentAccessInfo,
  isTeacherAssignedToStudent,
  updateStudent,
  archiveStudent,
} from "@/modules/academic/service";

type Params = { params: { id: string } };

/**
 * GET /api/v1/students/:id
 * راجع docs/api/API.md — Admin, Teacher (المسؤول عن الطالب فعلياً), Parent (لأبنائه فقط), Student (نفسه)
 * هذه أهم نقطة أمنية بكامل الوحدة — راجعها security-reviewer Agent إلزامياً قبل الدمج.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const { role, id: userId } = session.user;

  if (hasRole(role, ["ADMIN", "ACCOUNTANT"])) {
    const student = await getStudentById(params.id);
    if (!student) return apiError("NOT_FOUND", "الطالب غير موجود");
    return apiSuccess(student);
  }

  const { guardianUserId, ownUserId } = await getStudentAccessInfo(params.id);

  const isTeacherOfStudent =
    role === "TEACHER" ? await isTeacherAssignedToStudent(userId, params.id) : false;

  const allowed = canAccessStudent({
    requesterRole: role as "ADMIN" | "TEACHER" | "PARENT" | "STUDENT" | "ACCOUNTANT",
    requesterUserId: userId,
    studentGuardianUserId: guardianUserId,
    isTeacherOfStudent,
    studentOwnUserId: ownUserId,
  });

  if (!allowed) {
    // لا نكشف حتى وجود الطالب من عدمه لغير المصرح لهم — FORBIDDEN موحّدة
    return apiError("FORBIDDEN", "لا صلاحية للوصول لبيانات هذا الطالب");
  }

  const student = await getStudentById(params.id);
  if (!student) return apiError("NOT_FOUND", "الطالب غير موجود");
  return apiSuccess(student);
}

/** PATCH /api/v1/students/:id — الدور: Admin فقط */
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لتعديل بيانات الطالب");
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStudentSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات التعديل غير صحيحة");

  const updated = await updateStudent(params.id, parsed.data);
  return apiSuccess(updated);
}

/** DELETE /api/v1/students/:id — أرشفة (Soft Delete) لا حذف فعلي — الدور: Admin فقط */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لأرشفة الطالب");
  }

  const archived = await archiveStudent(params.id);
  return apiSuccess(archived);
}
