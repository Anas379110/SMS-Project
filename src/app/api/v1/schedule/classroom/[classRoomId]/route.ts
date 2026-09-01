import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { getScheduleForClassRoom, isUserRelatedToClassRoom } from "@/modules/schedule/service";

type Params = { params: { classRoomId: string } };

/**
 * GET /api/v1/schedule/classroom/:classRoomId — راجع docs/api/API.md
 * "كل الأدوار المرتبطة بالفصل": Admin/Accountant دائماً، Teacher إن كان مسنداً لهذا
 * الفصل، Parent/Student إن كان الطالب المرتبط مسجّلاً بهذا الفصل فعلياً.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const { role, id: userId } = session.user;

  if (!hasRole(role, ["ADMIN", "ACCOUNTANT"])) {
    const related = await isUserRelatedToClassRoom({ role, userId, classRoomId: params.classRoomId });
    if (!related) return apiError("FORBIDDEN", "لا صلاحية للوصول لجدول هذا الفصل");
  }

  const entries = await getScheduleForClassRoom(params.classRoomId);
  return apiSuccess({ items: entries });
}
