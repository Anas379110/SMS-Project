"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createInvoiceSchema, type CreateInvoiceInput } from "@/modules/financial/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Option = { id: string; label: string };

type Props = {
  students: Option[];
  feeStructures: Option[];
};

export function CreateInvoiceForm({ students, feeStructures }: Props) {
  const t = useTranslations("finance");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
  });

  async function onSubmit(data: CreateInvoiceInput) {
    setServerError(null);
    setSuccessMessage(null);

    const res = await fetch("/api/v1/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? t("saveError"));
      return;
    }

    setSuccessMessage(t("savedSuccess"));
    reset();
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
              {s.label}
            </option>
          ))}
        </select>
        {errors.studentId && <p className="text-xs text-red-600">{errors.studentId.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="feeStructureId" className="text-sm font-medium text-neutral-700">
          {t("feeStructure")}
        </label>
        <select
          id="feeStructureId"
          className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          {...register("feeStructureId")}
        >
          <option value="">—</option>
          {feeStructures.map((fs) => (
            <option key={fs.id} value={fs.id}>
              {fs.label}
            </option>
          ))}
        </select>
        {errors.feeStructureId && (
          <p className="text-xs text-red-600">{errors.feeStructureId.message}</p>
        )}
      </div>

      <Input
        id="dueDate"
        type="date"
        label={t("dueDate")}
        error={errors.dueDate?.message}
        {...register("dueDate")}
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
        {isSubmitting ? t("saving") : t("createInvoice")}
      </Button>
    </form>
  );
}
