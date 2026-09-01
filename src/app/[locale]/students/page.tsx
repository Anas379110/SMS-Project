import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { listStudents, listStudentsForGuardian } from "@/modules/academic/service";
import { StatusBadge } from "@/components/ui/StatusBadge";

/**
 * راجع docs/design/UI-UX.md — شاشة "قائمة/تفاصيل الطلاب" (Admin, Teacher).
 * لولي الأمر شاشة مختلفة منطقياً (أبناؤه فقط) لكن نفس المسار — لا حاجة صفحة منفصلة
 * بهذه المرحلة، الفرق بالبيانات المُعادة فقط (تُطبَّق بـ Service Layer مسبقاً).
 */
export default async function StudentsPage() {
  const session = await requireSession(["ADMIN", "TEACHER", "PARENT", "ACCOUNTANT"]);
  const t = await getTranslations("students");
  const common = await getTranslations("common");

  const role = session.user.role;
  const students =
    role === "PARENT"
      ? await listStudentsForGuardian(session.user.id)
      : (await listStudents({ page: 1, limit: 50 })).items;

  const canAdd = role === "ADMIN";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">{t("title")}</h1>
        {canAdd && (
          <Link
            href="/students/new"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg hover:opacity-90"
          >
            {t("addStudent")}
          </Link>
        )}
      </div>

      {students.length === 0 ? (
        // راجع docs/design/UI-UX.md القسم 7 — Empty State بلا صمت
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p className="mb-3">{t("emptyState")}</p>
          {canAdd && (
            <Link href="/students/new" className="text-sm font-medium text-brand hover:underline">
              {t("emptyStateAction")}
            </Link>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {students.map((student) => (
            <li key={student.id} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="font-medium text-neutral-900">{student.fullName}</span>
                <StatusBadge
                  status={student.status as "active" | "archived"}
                  activeLabel={t("statusActive")}
                  archivedLabel={t("statusArchived")}
                />
              </div>
              <Link
                href={`/students/${student.id}`}
                className="text-sm font-medium text-brand hover:underline"
              >
                {t("viewDetails")}
              </Link>
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
