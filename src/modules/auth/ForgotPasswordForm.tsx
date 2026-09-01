"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/modules/auth/passwordResetSchema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  async function onSubmit(data: RequestPasswordResetInput) {
    setSuccessMessage(null);

    await fetch("/api/v1/auth/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // نعرض رسالة النجاح دائماً بغض النظر عن استجابة الخادم — الخادم نفسه يُعيد
    // نفس الرسالة العامة دائماً (راجع الـ Route: لا كشف وجود البريد من عدمه)
    setSuccessMessage(t("resetRequestSuccess"));
  }

  if (successMessage) {
    return <p className="text-sm text-green-700">{successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        id="email"
        type="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("submitting") : t("resetRequestButton")}
      </Button>
    </form>
  );
}
