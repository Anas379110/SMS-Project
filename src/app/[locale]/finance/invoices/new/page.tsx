import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { listStudents } from "@/modules/academic/service";
import { listFeeStructures } from "@/modules/financial/service";
import { CreateInvoiceForm } from "@/modules/financial/CreateInvoiceForm";

export default async function NewInvoicePage() {
  await requireSession(["ADMIN", "ACCOUNTANT"]);
  const t = await getTranslations("finance");

  const [{ items: students }, feeStructures] = await Promise.all([
    listStudents({ page: 1, limit: 100 }),
    listFeeStructures(),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link
        href="/finance/fee-structures"
        className="mb-6 inline-block text-sm text-neutral-500 hover:text-brand"
      >
        ← {t("feeStructures")}
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("createInvoice")}</h1>
        <CreateInvoiceForm
          students={students.map((s) => ({ id: s.id, label: s.fullName }))}
          feeStructures={feeStructures.map((fs) => ({ id: fs.id, label: fs.label }))}
        />
      </div>
    </main>
  );
}
