"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type Student = { id: string; fullName: string };

type Props = {
  classRoomId: string;
  availableStudents: Student[];
};

/**
 * راجع DECISIONS.md — يسدّ فجوة وظيفية كانت تمنع أي استخدام فعلي للنظام
 * (طلاب بلا تسجيل بفصل = لا حضور ولا درجات ممكنة عملياً).
 */
export function EnrollStudentControl({ classRoomId, availableStudents }: Props) {
  const t = useTranslations("enrollments");
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  async function handleEnroll() {
    if (!selectedStudentId) return;
    setIsSaving(true);
    setMessage(null);

    const res = await fetch("/api/v1/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudentId, classRoomId }),
    });

    setIsSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const text =
        body?.error?.code === "CONFLICT" ? t("alreadyEnrolled") : t("enrollError");
      setMessage({ type: "error", text });
      return;
    }

    setMessage({ type: "success", text: t("enrolledSuccess") });
    setSelectedStudentId("");
    router.refresh();
  }

  if (availableStudents.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-sm font-medium text-neutral-700">{t("enrollStudent")}</p>
      <div className="flex gap-2">
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="">{t("selectStudent")}</option>
          {availableStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={handleEnroll}
          isLoading={isSaving}
          disabled={!selectedStudentId}
          className="w-auto px-4"
        >
          {isSaving ? t("enrolling") : t("enrollButton")}
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
