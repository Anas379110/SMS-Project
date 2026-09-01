import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { listNotificationsForUser, countUnreadNotifications } from "@/modules/notifications/service";

/**
 * GET /api/v1/notifications — راجع docs/requirements/SRS.md (FR-8).
 * كل مستخدم يرى إشعاراته الخاصة فقط (userId من الجلسة، لا Query خارجي) —
 * لا حاجة RBAC إضافي بالدور هنا، العزل عبر userId كافٍ وآمن.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const [items, unreadCount] = await Promise.all([
    listNotificationsForUser(session.user.id),
    countUnreadNotifications(session.user.id),
  ]);

  return apiSuccess({ items, unreadCount });
}
