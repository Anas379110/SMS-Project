import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { listFeeStructures } from "@/modules/financial/service";
import { CreateFeeStructureForm } from "@/modules/financial/CreateFeeStructureForm";

export default async function FeeStructuresPage() {
  await requireSession(["ADMIN", "ACCOUNTANT"]);
  const t = await getTranslations("finance");
  const common = await getTranslations("common");

  const feeStructures = await listFeeStructures();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("feeStructures")}</h1>

      <div className="mb-6">
        <CreateFeeStructureForm />
      </div>

      {feeStructures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p>{t("noFeeStructures")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {feeStructures.map((fs) => (
            <li key={fs.id} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="font-medium text-neutral-900">{fs.label}</p>
                <p className="text-xs text-neutral-500">{fs.academicYear}</p>
              </div>
              <span className="font-semibold text-neutral-900">{fs.amount}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/" className="mt-6 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {common("cancel")}
      </Link>
    </main>
  );
}
