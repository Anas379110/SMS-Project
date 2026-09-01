import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/modules/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-neutral-900">{t("resetRequestTitle")}</h1>
        <p className="mb-6 text-sm text-neutral-500">{t("resetRequestSubtitle")}</p>

        <ForgotPasswordForm />

        <Link href="/login" className="mt-5 block text-center text-sm text-neutral-500 hover:text-brand">
          ← {t("backToLogin")}
        </Link>
      </div>
    </main>
  );
}
