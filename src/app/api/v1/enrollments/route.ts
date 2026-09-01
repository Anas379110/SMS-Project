import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { enrollStudentSchema } from "@/modules/academic/schema";
import { enrollStudent } from "@/modules/academic/service";

/**
 * POST /api/v1/enrollments — تسجيل طالب بفصل دراسي (Admin فقط).
 *
 * ⚠️ فجوة وظيفية اكتُشفت بمراجعة ذاتية (راجع DECISIONS.md بتاريخ اكتشافها):
 * كانت دالة enrollStudent موجودة بطبقة الخدمة منذ Increment 2 لكن بلا أي
 * Endpoint أو واجهة تستدعيها — ما يعني أن أي طالب يُضاف لن يظهر بأي فصل
 * فعلياً، وبالتالي لا حضور ولا درجات ممكنة له عملياً. هذا أهم اكتشاف بمراجعة
 * اليوم لأنه يعطّل الاستخدام الفعلي للنظام بالكامل، لا مجرد ثغرة أمنية جزئية.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لتسجيل طالب بفصل");
  }

  const body = await request.json().catch(() => null);
  const parsed = enrollStudentSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات التسجيل غير صحيحة");

  try {
    const enrollment = await enrollStudent(parsed.data);
    return apiSuccess(enrollment, 201);
  } catch {
    // خطأ متوقع الأرجح: الطالب مسجّل مسبقاً بهذا الفصل (Unique Constraint)
    return apiError("CONFLICT", "الطالب مسجّل مسبقاً بهذا الفصل");
  }
}
