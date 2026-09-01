import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { countUnreadNotifications } from "@/modules/notifications/service";
import { SignOutButton } from "@/modules/auth/SignOutButton";

/**
 * راجع DECISIONS.md — كانت هذه الصفحة لا تزال بنسختها الأولية من Increment 1
 * (Auth+Branding) بلا أي رابط تنقّل لأي من الوحدات الست المبنية لاحقاً، ما كان
 * يعني عملياً عدم وجود طريقة استخدام فعلية للنظام إلا بكتابة روابط يدوياً.
 * هذه اللوحة الآن تعرض روابط مخصصة لكل دور حسب صلاحياته الفعلية.
 */
export default async function HomePage() {
  const session = await requireSession();
  const common = await getTranslations("common");
  const dashT = await getTranslations("dashboard");

  const settings = await getSchoolSettings();
  const role = session.user.role;

  const unreadCount = await countUnreadNotifications(session.user.id);

  const linksByRole: Record<string, { href: string; label: string }[]> = {
    ADMIN: [
      { href: "/students", label: dashT("students") },
      { href: "/classrooms", label: dashT("classrooms") },
      { href: "/finance/summary", label: dashT("finance") },
    ],
    TEACHER: [
      { href: "/attendance", label: dashT("attendance") },
      { href: "/grades", label: dashT("grades") },
    ],
    PARENT: [
      { href: "/students", label: dashT("myChildren") },
      { href: "/finance/summary", label: dashT("finance") },
    ],
    ACCOUNTANT: [
      { href: "/finance/fee-structures", label: dashT("finance") },
      { href: "/students", label: dashT("students") },
    ],
    STUDENT: [],
  };

  const links = linksByRole[role] ?? [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {common("appName")} — {settings.schoolName}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {dashT("welcome")} {session.user.name}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-900 hover:border-brand hover:text-brand"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/notifications"
          className="relative rounded-xl border border-neutral-200 bg-white p-4 text-center text-sm font-medium text-neutral-900 hover:border-brand hover:text-brand"
        >
          {dashT("notifications")}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </main>
  );
}
