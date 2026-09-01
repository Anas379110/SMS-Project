"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginSchema, type LoginInput } from "@/modules/auth/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * راجع docs/design/UI-UX.md القسم 7: حالات Loading/Error إلزامية —
 * لا رسالة خطأ تقنية أبداً (رسالة موحّدة بلا كشف أي البيانات كانت خاطئة).
 */
export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      // رسالة موحّدة — لا نكشف إن كان البريد أم كلمة المرور هي الخاطئة (CLAUDE.md القسم 10)
      setServerError(t("invalidCredentials"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        id="email"
        type="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        error={errors.email ? t("invalidCredentials") : undefined}
        {...register("email")}
      />
      <Input
        id="password"
        type="password"
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        error={errors.password ? t("invalidCredentials") : undefined}
        {...register("password")}
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("submitting") : t("submitButton")}
      </Button>
    </form>
  );
}
