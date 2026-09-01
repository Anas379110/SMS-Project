"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type AttendanceRow = {
  studentId: string;
  fullName: string;
  status: "PRESENT" | "ABSENT" | "LATE";
};

type Props = {
  classRoomId: string;
  initialRows: AttendanceRow[];
  date: string; // YYYY-MM-DD
};

/**
 * راجع docs/design/UI-UX.md — Flow تسجيل الحضور:
 * "كل الطلاب حاضر افتراضياً → تعديل الاستثناءات فقط بنقرة واحدة → حفظ".
 * هذا أهم Flow بالنظام؛ يجب أن يبقى بسيطاً وسريعاً دائماً — لا تُضف خطوات هنا
 * دون داعٍ حقيقي واضح.
 */
export function AttendanceSheet({ classRoomId, initialRows, date }: Props) {
  const t = useTranslations("attendance");
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function setStatus(studentId: string, status: AttendanceRow["status"]) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    const res = await fetch("/api/v1/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classRoomId,
        date,
        records: rows.map((r) => ({ studentId: r.studentId, status: r.status })),
      }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: t("saveError") });
      return;
    }

    setMessage({ type: "success", text: t("savedSuccess") });
    router.refresh();
  }

  const statusOptions: { value: AttendanceRow["status"]; label: string; activeClass: string }[] = [
    { value: "PRESENT", label: t("present"), activeClass: "bg-green-600 text-white" },
    { value: "LATE", label: t("late"), activeClass: "bg-amber-500 text-white" },
    { value: "ABSENT", label: t("absent"), activeClass: "bg-red-600 text-white" },
  ];

  if (rows.length === 0) {
    return <p className="text-neutral-500">{t("noStudents")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {rows.map((row) => (
          <li key={row.studentId} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-medium text-neutral-900">{row.fullName}</span>
            <div className="flex gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(row.studentId, opt.value)}
                  className={`min-w-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    row.status === opt.value
                      ? opt.activeClass
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {message && (
        <p
          role="alert"
          className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}
        >
          {message.text}
        </p>
      )}

      <Button type="button" onClick={handleSave} isLoading={isSaving}>
        {isSaving ? t("saving") : t("saveButton")}
      </Button>
    </div>
  );
}
