import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { CreateStudentForm } from "@/modules/academic/CreateStudentForm";

export default async function NewStudentPage() {
  await requireSession(["ADMIN"]);
  const t = await getTranslations("students");

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/students" className="mb-6 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("backToList")}
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("addStudent")}</h1>
        <CreateStudentForm />
      </div>
    </main>
  );
}
