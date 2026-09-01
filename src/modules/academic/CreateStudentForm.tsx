"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createStudentSchema, type CreateStudentInput } from "@/modules/academic/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateStudentForm() {
  const t = useTranslations("students");
  const common = useTranslations("common");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
  });

  async function onSubmit(data: CreateStudentInput) {
    setServerError(null);

    const res = await fetch("/api/v1/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? common("cancel"));
      return;
    }

    router.push("/students");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        id="fullName"
        type="text"
        label={t("fullName")}
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        id="birthDate"
        type="date"
        label={t("birthDate")}
        error={errors.birthDate?.message}
        {...register("birthDate")}
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? common("loading") : common("save")}
      </Button>
    </form>
  );
}
