import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { canAccessStudent } from "@/modules/auth/rbac";
import {
  getStudentById,
  getStudentAccessInfo,
  isTeacherAssignedToStudent,
} from "@/modules/academic/service";
import { getAttendanceForStudent } from "@/modules/attendance/service";
import { getGradesForStudent } from "@/modules/grades/service";
import { getInvoicesForStudent } from "@/modules/financial/service";
import { RecordManualPaymentForm } from "@/modules/financial/RecordManualPaymentForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Role } from "@prisma/client";

/**
 * أهم شاشة أمنياً بالمشروع حتى الآن — راجع security-reviewer Agent إلزامياً.
 * تُطبّق نفس منطق RBAC المستخدم بـ API Route (canAccessStudent) لضمان اتساق
 * القاعدة بين الواجهة والـ API (مصدر حقيقة واحد بـ src/modules/auth/rbac.ts).
 */
export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession(["ADMIN", "TEACHER", "PARENT", "ACCOUNTANT", "STUDENT"]);
  const t = await getTranslations("students");

  const role = session.user.role as Role;
  const userId = session.user.id;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    const { guardianUserId, ownUserId } = await getStudentAccessInfo(params.id);
    const isTeacherOfStudent =
      role === "TEACHER" ? await isTeacherAssignedToStudent(userId, params.id) : false;

    const allowed = canAccessStudent({
      requesterRole: role,
      requesterUserId: userId,
      studentGuardianUserId: guardianUserId,
      isTeacherOfStudent,
      studentOwnUserId: ownUserId,
    });

    if (!allowed) {
      // راجع docs/design/UI-UX.md القسم 7 — رسالة خطأ بلغة بشرية، لا كشف تقني
      return (
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-neutral-700">{t("forbidden")}</p>
          <Link href="/students" className="mt-4 inline-block text-sm text-brand hover:underline">
            ← {t("backToList")}
          </Link>
        </main>
      );
    }
  }

  const student = await getStudentById(params.id);

  if (!student) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-neutral-700">{t("notFound")}</p>
        <Link href="/students" className="mt-4 inline-block text-sm text-brand hover:underline">
          ← {t("backToList")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/students" className="mb-6 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("backToList")}
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-bold text-neutral-900">{student.fullName}</h1>
          <StatusBadge
            status={student.status as "active" | "archived"}
            activeLabel={t("statusActive")}
            archivedLabel={t("statusArchived")}
          />
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500">{t("guardian")}</dt>
            <dd className="font-medium text-neutral-900">
              {student.guardian?.user.fullName ?? t("noGuardian")}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">{t("birthDate")}</dt>
            <dd className="font-medium text-neutral-900">
              {student.birthDate ? new Date(student.birthDate).toLocaleDateString() : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-500">{t("enrolledClasses")}</dt>
            <dd className="font-medium text-neutral-900">
              {student.enrollments.length > 0
                ? student.enrollments.map((e) => e.classRoom.name).join("، ")
                : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <AttendanceHistorySection studentId={student.id} />
      <GradesSection studentId={student.id} />
      {role !== "TEACHER" && (
        <InvoicesSection studentId={student.id} canRecordPayment={role === "ADMIN" || role === "ACCOUNTANT"} />
      )}
    </main>
  );
}

async function InvoicesSection({
  studentId,
  canRecordPayment,
}: {
  studentId: string;
  canRecordPayment: boolean;
}) {
  const t = await getTranslations("finance");
  const invoices = await getInvoicesForStudent(studentId);

  const statusLabel: Record<string, string> = {
    PENDING: t("statusPending"),
    PARTIALLY_PAID: t("statusPartiallyPaid"),
    PAID: t("statusPaid"),
    OVERDUE: t("statusOverdue"),
    CANCELLED: t("statusCancelled"),
  };

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">{t("invoices")}</h2>
      {invoices.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("noInvoices")}</p>
      ) : (
        <ul className="divide-y divide-neutral-100 text-sm">
          {invoices.map((inv) => {
            const paidSoFar = inv.payments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = inv.amount - paidSoFar;
            return (
              <li key={inv.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">{inv.feeStructure.label}</span>
                  <span className="font-semibold text-neutral-900">
                    {inv.amount} — {statusLabel[inv.status]}
                  </span>
                </div>
                {canRecordPayment && remaining > 0 && (
                  <RecordManualPaymentForm invoiceId={inv.id} remainingAmount={remaining} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

async function GradesSection({ studentId }: { studentId: string }) {
  const t = await getTranslations("grades");
  const grades = await getGradesForStudent(studentId);

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">{t("historyTitle")}</h2>
      {grades.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("noGrades")}</p>
      ) : (
        <ul className="divide-y divide-neutral-100 text-sm">
          {grades.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-2">
              <span className="text-neutral-600">
                {g.subject.name} — {g.term}
              </span>
              <span className="font-semibold text-neutral-900">{g.score}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function AttendanceHistorySection({ studentId }: { studentId: string }) {
  const t = await getTranslations("attendance");
  const records = await getAttendanceForStudent(studentId);
  const recent = records.slice(0, 10);

  const statusLabel: Record<string, string> = {
    PRESENT: t("present"),
    ABSENT: t("absent"),
    LATE: t("late"),
  };

  return (
    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">{t("historyTitle")}</h2>
      {recent.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("noHistory")}</p>
      ) : (
        <ul className="divide-y divide-neutral-100 text-sm">
          {recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span className="text-neutral-600">
                {new Date(r.date).toLocaleDateString()} — {r.classRoom.name}
              </span>
              <span
                className={
                  r.status === "ABSENT"
                    ? "font-medium text-red-600"
                    : r.status === "LATE"
                      ? "font-medium text-amber-600"
                      : "font-medium text-green-700"
                }
              >
                {statusLabel[r.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
