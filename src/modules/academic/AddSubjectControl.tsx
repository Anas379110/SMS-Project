"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function AddSubjectControl() {
  const t = useTranslations("teacherAssignments");
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/v1/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError(t("assignError"));
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="subjectName" className="mb-1 block text-xs font-medium text-neutral-600">
          {t("subjectName")}
        </label>
        <input
          id="subjectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>
      <Button type="submit" isLoading={isSaving} className="w-auto px-4">
        {t("addSubject")}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
