"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
};

const typeLabelKey: Record<string, string> = {
  ATTENDANCE_ABSENCE: "typeAttendanceAbsence",
  NEW_GRADE: "typeNewGrade",
  NEW_INVOICE: "typeNewInvoice",
};

export function NotificationsList({ initialItems }: { initialItems: NotificationItem[] }) {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [items, setItems] = useState(initialItems);

  async function markAsRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
    router.refresh();
  }

  async function markAllAsRead() {
    const unread = items.filter((n) => !n.isRead);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.all(
      unread.map((n) => fetch(`/api/v1/notifications/${n.id}/read`, { method: "PATCH" }))
    );
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
        <p>{t("empty")}</p>
      </div>
    );
  }

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-4">
      {hasUnread && (
        <Button type="button" onClick={markAllAsRead} className="w-auto self-end px-3 py-1.5 text-xs">
          {t("markAllRead")}
        </Button>
      )}
      <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
        {items.map((n) => (
          <li
            key={n.id}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 ${
              n.isRead ? "" : "bg-brand/5"
            }`}
          >
            {!n.isRead && (
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" aria-hidden="true" />
            )}
            <div className={n.isRead ? "ms-5" : ""}>
              <p className="text-xs font-medium text-neutral-500">
                {t(typeLabelKey[n.type] ?? "typeAttendanceAbsence")}
              </p>
              <p className="text-sm text-neutral-900">{n.message}</p>
              <p className="mt-0.5 text-xs text-neutral-400">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
