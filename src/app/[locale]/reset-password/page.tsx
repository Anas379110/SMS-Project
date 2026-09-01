import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/modules/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const t = await getTranslations("auth");
  const token = searchParams.token;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("resetConfirmTitle")}</h1>

        {!token ? (
          <p className="text-sm text-red-600">{t("resetLinkInvalid")}</p>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </main>
  );
}
