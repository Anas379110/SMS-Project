import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { markAttendanceSchema } from "@/modules/attendance/schema";
import { markAttendance } from "@/modules/attendance/service";
import { validateTeacherBatchForClassRoom } from "@/modules/academic/service";

/**
 * POST /api/v1/attendance — راجع docs/api/API.md
 * الدور: Teacher فقط. تحقق أمني دفعي كامل (راجع validateTeacherBatchForClassRoom):
 * المعلم مسند لهذا الفصل بالذات، وكل طالب بالقائمة مسجّل فعلياً بنفس الفصل —
 * لا يكفي التحقق من طالب واحد فقط (ثغرة سابقة صُححت بمراجعة أمنية ذاتية،
 * راجع DECISIONS.md).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["TEACHER"])) {
    return apiError("FORBIDDEN", "لا صلاحية لتسجيل الحضور");
  }

  const body = await request.json().catch(() => null);
  const parsed = markAttendanceSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الحضور غير صحيحة");

  const isValidBatch = await validateTeacherBatchForClassRoom({
    teacherUserId: session.user.id,
    classRoomId: parsed.data.classRoomId,
    studentIds: parsed.data.records.map((r) => r.studentId),
  });

  if (!isValidBatch) {
    return apiError("FORBIDDEN", "لست مسؤولاً عن هذا الفصل، أو أحد الطلاب لا يتبع له");
  }

  const result = await markAttendance(parsed.data);
  return apiSuccess({ items: result }, 201);
}
