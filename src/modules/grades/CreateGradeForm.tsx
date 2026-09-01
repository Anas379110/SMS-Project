"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createGradeSchema, type CreateGradeInput } from "@/modules/grades/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Student = { id: string; fullName: string };

type Props = {
  students: Student[];
  subjectId: string;
};

export function CreateGradeForm({ students, subjectId }: Props) {
  const t = useTranslations("grades");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGradeInput>({
    resolver: zodResolver(createGradeSchema),
    defaultValues: { subjectId },
  });

  async function onSubmit(data: CreateGradeInput) {
    setServerError(null);
    setSuccessMessage(null);

    const res = await fetch("/api/v1/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, subjectId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? t("saveError"));
      return;
    }

    setSuccessMessage(t("savedSuccess"));
    reset({ subjectId, studentId: "", score: undefined, term: data.term });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="studentId" className="text-sm font-medium text-neutral-700">
          {t("student")}
        </label>
        <select
          id="studentId"
          className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          {...register("studentId")}
        >
          <option value="">—</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
        {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
      </div>

      <Input
        id="score"
        type="number"
        step="0.01"
        label={t("score")}
        error={errors.score?.message}
        {...register("score", { valueAsNumber: true })}
      />
      <Input
        id="term"
        type="text"
        label={t("term")}
        placeholder={t("termPlaceholder")}
        error={errors.term?.message}
        {...register("term")}
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("saving") : t("saveButton")}
      </Button>
    </form>
  );
}
