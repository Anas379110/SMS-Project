"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createScheduleEntrySchema,
  dayOfWeekEnum,
  type CreateScheduleEntryInput,
} from "@/modules/schedule/schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Subject = { id: string; name: string };

type Props = {
  classRoomId: string;
  subjects: Subject[];
};

export function CreateScheduleEntryForm({ classRoomId, subjects }: Props) {
  const t = useTranslations("schedule");
  const common = useTranslations("common");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateScheduleEntryInput>({
    resolver: zodResolver(createScheduleEntrySchema),
    defaultValues: { classRoomId },
  });

  async function onSubmit(data: CreateScheduleEntryInput) {
    setServerError(null);

    const res = await fetch("/api/v1/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, classRoomId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error?.message ?? t("saveError"));
      return;
    }

    reset({ classRoomId });
    setIsOpen(false);
    router.refresh();
  }

  if (!isOpen) {
    return (
      <Button type="button" className="w-auto px-4" onClick={() => setIsOpen(true)}>
        {t("addEntry")}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dayOfWeek" className="text-sm font-medium text-neutral-700">
          {t("day")}
        </label>
        <select
          id="dayOfWeek"
          className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          {...register("dayOfWeek")}
        >
          {dayOfWeekEnum.options.map((day) => (
            <option key={day} value={day}>
              {t(`days.${day}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subjectId" className="text-sm font-medium text-neutral-700">
          {t("subject")}
        </label>
        <select
          id="subjectId"
          className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          {...register("subjectId")}
        >
          <option value="">—</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {errors.subjectId && <p className="text-xs text-red-600">{errors.subjectId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="startTime" type="time" label={t("startTime")} error={errors.startTime?.message} {...register("startTime")} />
        <Input id="endTime" type="time" label={t("endTime")} error={errors.endTime?.message} {...register("endTime")} />
      </div>

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
