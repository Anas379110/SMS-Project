"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClassRoomSchema, type CreateClassRoomInput } from "@/modules/academic/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateClassRoomForm() {
  const t = useTranslations("classrooms");
  const common = useTranslations("common");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClassRoomInput>({
    resolver: zodResolver(createClassRoomSchema),
  });

  async function onSubmit(data: CreateClassRoomInput) {
    setServerError(null);

    const res = await fetch("/api/v1/classrooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? common("cancel"));
      return;
    }

    reset();
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <Button type="button" className="w-auto px-4" onClick={() => setIsOpen(true)}>
        {t("addClassRoom")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      noValidate
    >
      <Input id="name" type="text" label={t("name")} error={errors.name?.message} {...register("name")} />
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
          {isSubmitting ? common("loading") : common("save")}
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
