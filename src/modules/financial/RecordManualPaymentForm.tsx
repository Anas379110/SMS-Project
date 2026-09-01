"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type Props = {
  invoiceId: string;
  remainingAmount: number;
};

/**
 * راجع DECISIONS.md — التسوية اليدوية إلزامية لسوريا دائماً، ومتاحة كخطة طوارئ
 * لباقي الدول. لا معالجة بيانات بطاقة هنا إطلاقاً (راجع CLAUDE.md القسم 14) —
 * هذا فقط تسجيل مبلغ استُلم فعلياً خارج النظام.
 */
export function RecordManualPaymentForm({ invoiceId, remainingAmount }: Props) {
  const t = useTranslations("finance");
  const router = useRouter();
  const [amount, setAmount] = useState(remainingAmount);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const res = await fetch("/api/v1/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, amount }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setError(t("saveError"));
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-28 rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        aria-label={t("paymentAmount")}
      />
      <Button type="submit" isLoading={isSaving} className="w-auto px-3 py-1.5 text-xs">
        {isSaving ? t("saving") : t("recordPayment")}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
