"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createFeeStructureSchema,
  type CreateFeeStructureInput,
} from "@/modules/financial/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateFeeStructureForm() {
  const t = useTranslations("finance");
  const common = useTranslations("common");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFeeStructureInput>({
    resolver: zodResolver(createFeeStructureSchema),
  });

  async function onSubmit(data: CreateFeeStructureInput) {
    setServerError(null);

    const res = await fetch("/api/v1/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? t("saveError"));
      return;
    }

    reset();
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <Button type="button" className="w-auto px-4" onClick={() => setIsOpen(true)}>
        {t("addFeeStructure")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      noValidate
    >
      <Input id="label" type="text" label={t("label")} error={errors.label?.message} {...register("label")} />
      <Input
        id="amount"
        type="number"
        step="0.01"
        label={t("amount")}
        error={errors.amount?.message}
        {...register("amount", { valueAsNumber: true })}
      />
      <Input
        id="academicYear"
        type="text"
        label={t("academicYear")}
        placeholder="2026-2027"
        error={errors.academicYear?.message}
        {...register("academicYear")}
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? t("saving") : t("saveButton")}
        </Button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          {common("cancel")}
        </button>
      </div>
    </form>
  );
}
