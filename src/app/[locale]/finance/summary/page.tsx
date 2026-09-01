import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { getFinancialSummary } from "@/modules/financial/service";

export default async function FinancialSummaryPage() {
  await requireSession(["ADMIN", "ACCOUNTANT"]);
  const t = await getTranslations("finance");

  const summary = await getFinancialSummary();

  const cards = [
    { key: "pending", label: t("statusPending"), color: "text-neutral-700" },
    { key: "partiallyPaid", label: t("statusPartiallyPaid"), color: "text-amber-600" },
    { key: "paid", label: t("statusPaid"), color: "text-green-700" },
    { key: "overdue", label: t("statusOverdue"), color: "text-red-600" },
  ] as const;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("summaryTitle")}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => {
          const data = summary[card.key];
          return (
            <div key={card.key} className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <p className={`text-2xl font-bold ${card.color}`}>{data.total}</p>
              <p className="mt-1 text-xs text-neutral-500">{card.label}</p>
              <p className="text-xs text-neutral-400">({data.count})</p>
            </div>
          );
        })}
      </div>

      <Link href="/finance/fee-structures" className="mt-6 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("feeStructures")}
      </Link>
    </main>
  );
}
