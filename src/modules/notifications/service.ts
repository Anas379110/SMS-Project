import { prisma } from "@/lib/prisma";

/** راجع docs/requirements/SRS.md (FR-8) — كانت الوحدة غائبة بالكامل رغم إنشاء سجلات Notification منذ Increment 3 */

export async function listNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

/** يتحقق ضمنياً أن الإشعار يخص المستخدم صاحب الجلسة قبل التعديل — راجع Route */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) return null;

  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
