import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";
import { LoginForm } from "@/modules/auth/LoginForm";

/**
 * راجع docs/design/UI-UX.md — Flow: تسجيل الدخول.
 * الشعار والألوان تُحمَّل ديناميكياً من SchoolSettings (Branding Module) — هذه
 * الشاشة هي أول نقطة تُظهر فيها هوية كل مدرسة بصرياً.
 */
export default async function LoginPage() {
  const t = await getTranslations("auth");
  const common = await getTranslations("common");
  const settings = await getSchoolSettings();

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={settings.schoolName}
              className="h-14 w-14 rounded-lg object-contain"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-fg"
              aria-hidden="true"
            >
              {settings.schoolName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-neutral-900">{settings.schoolName}</h1>
            <p className="text-sm text-neutral-500">{common("appName")}</p>
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-neutral-900">{t("loginTitle")}</h2>
        <p className="mb-6 text-sm text-neutral-500">{t("loginSubtitle")}</p>

        <LoginForm />

        <Link
          href="/forgot-password"
          className="mt-5 block text-center text-sm text-neutral-500 hover:text-brand"
        >
          {t("forgotPassword")}
        </Link>
      </div>
    </main>
  );
}
