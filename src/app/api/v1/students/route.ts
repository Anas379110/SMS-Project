import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createStudentSchema, listQuerySchema } from "@/modules/academic/schema";
import {
  listStudents,
  listStudentsForGuardian,
  createStudent,
} from "@/modules/academic/service";

/**
 * GET /api/v1/students — راجع docs/api/API.md
 * الأدوار: Admin, Teacher (قائمة كاملة/مفلترة) — Parent (أبناؤه فقط تلقائياً)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const role = session.user.role;
  const userId = session.user.id;

  // Parent: لا حاجة Query معقد — يعيد أبناءه فقط دائماً بغض النظر عن أي Query يُرسل
  if (role === "PARENT") {
    const students = await listStudentsForGuardian(userId);
    return apiSuccess({ items: students, total: students.length });
  }

  if (!hasRole(role, ["ADMIN", "TEACHER", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية للوصول لهذا المورد");
  }

  const { searchParams } = new URL(request.url);
  const parsed = listQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    classRoomId: searchParams.get("classRoomId") ?? undefined,
  });

  if (!parsed.success) return apiError("VALIDATION_ERROR", "معطيات البحث غير صحيحة");

  const result = await listStudents(parsed.data);
  return apiSuccess(result);
}

/**
 * POST /api/v1/students — الدور: Admin فقط (راجع API.md)
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإضافة طالب");
  }

  const body = await request.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "بيانات الطالب غير صحيحة");
  }

  const student = await createStudent(parsed.data);
  return apiSuccess(student, 201);
}
