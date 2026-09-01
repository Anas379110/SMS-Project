import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createSubjectSchema } from "@/modules/grades/schema";
import { listSubjects, createSubject } from "@/modules/grades/service";

/** GET /api/v1/subjects — Admin, Teacher */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "TEACHER"])) {
    return apiError("FORBIDDEN", "لا صلاحية للوصول للمواد الدراسية");
  }

  const items = await listSubjects();
  return apiSuccess({ items });
}

/**
 * POST /api/v1/subjects — Admin فقط.
 * راجع DECISIONS.md: كانت دالة createSubject موجودة بطبقة الخدمة منذ Increment 4
 * بلا أي Endpoint يستدعيها — جزء من نفس فجوة "دور Teacher معطّل بالكامل".
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإضافة مادة دراسية");
  }

  const body = await request.json().catch(() => null);
  const parsed = createSubjectSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات المادة غير صحيحة");

  const subject = await createSubject(parsed.data);
  return apiSuccess(subject, 201);
}
