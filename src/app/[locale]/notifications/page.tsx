import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { listNotificationsForUser } from "@/modules/notifications/service";
import { NotificationsList } from "@/modules/notifications/NotificationsList";

export default async function NotificationsPage() {
  const session = await requireSession();
  const t = await getTranslations("notifications");

  const notifications = await listNotificationsForUser(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("title")}</h1>
      <NotificationsList initialItems={notifications} />
    </main>
  );
}
