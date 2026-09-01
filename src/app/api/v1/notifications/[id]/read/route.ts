import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { markNotificationAsRead } from "@/modules/notifications/service";

type Params = { params: { id: string } };

/**
 * PATCH /api/v1/notifications/:id/read
 * راجع src/modules/notifications/service.ts — markNotificationAsRead يتحقق
 * ضمنياً أن الإشعار يخص صاحب الجلسة (يرفض بصمت عبر null بدل كشف وجود إشعار
 * لمستخدم آخر من عدمه).
 */
export async function PATCH(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const result = await markNotificationAsRead(params.id, session.user.id);
  if (!result) return apiError("NOT_FOUND", "الإشعار غير موجود");

  return apiSuccess(result);
}
