"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const formSchema = z.object({ newPassword: z.string().min(8) });
type FormInput = z.infer<typeof formSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({ resolver: zodResolver(formSchema) });

  async function onSubmit(data: FormInput) {
    setServerError(null);

    const res = await fetch("/api/v1/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: data.newPassword }),
    });

    if (!res.ok) {
      setServerError(t("resetConfirmError"));
      return;
    }

    setSuccessMessage(t("resetConfirmSuccess"));
    setTimeout(() => router.push("/login"), 2000);
  }

  if (successMessage) {
    return <p className="text-sm text-green-700">{successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        id="newPassword"
        type="password"
        label={t("newPasswordLabel")}
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("submitting") : t("resetConfirmButton")}
      </Button>
    </form>
  );
}
