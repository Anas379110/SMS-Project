"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type Option = { id: string; label: string };

type Props = {
  classRoomId: string;
  teachers: Option[];
  subjects: Option[];
};

/**
 * راجع DECISIONS.md — يسدّ الفجوة الأخطر المكتشفة بالمشروع حتى الآن: بدونها
 * لا توجد وسيلة لإنشاء TeacherAssignment، ما يعطّل دور Teacher بالكامل.
 */
export function AssignTeacherControl({ classRoomId, teachers, subjects }: Props) {
  const t = useTranslations("teacherAssignments");
  const router = useRouter();
  const [teacherUserId, setTeacherUserId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleAssign() {
    if (!teacherUserId || !subjectId) return;
    setIsSaving(true);
    setMessage(null);

    const res = await fetch("/api/v1/teacher-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherUserId, classRoomId, subjectId }),
    });

    setIsSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const text = body?.error?.code === "CONFLICT" ? t("alreadyAssigned") : t("assignError");
      setMessage({ type: "error", text });
      return;
    }

    setMessage({ type: "success", text: t("assignedSuccess") });
    setTeacherUserId("");
    setSubjectId("");
    router.refresh();
  }

  if (teachers.length === 0 || subjects.length === 0) {
    return <p className="mb-6 text-sm text-neutral-500">{t("noSubjects")}</p>;
  }

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-medium text-neutral-700">{t("assignTeacher")}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={teacherUserId}
          onChange={(e) => setTeacherUserId(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="">{t("selectTeacher")}</option>
          {teachers.map((tOpt) => (
            <option key={tOpt.id} value={tOpt.id}>
              {tOpt.label}
            </option>
          ))}
        </select>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="">{t("selectSubject")}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={handleAssign}
          isLoading={isSaving}
          disabled={!teacherUserId || !subjectId}
          className="w-auto px-4"
        >
          {isSaving ? t("assigning") : t("assignButton")}
        </Button>
      </div>
      {message && (
        <p className={`text-xs ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
