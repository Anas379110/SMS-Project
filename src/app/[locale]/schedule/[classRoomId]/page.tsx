import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getScheduleForClassRoom, isUserRelatedToClassRoom } from "@/modules/schedule/service";
import { listSubjects } from "@/modules/grades/service";
import { CreateScheduleEntryForm } from "@/modules/schedule/CreateScheduleEntryForm";

/**
 * راجع docs/api/API.md — "كل الأدوار المرتبطة بالفصل" فقط. Admin/Accountant دائماً،
 * البقية بتحقق فعلي من ارتباطهم بهذا الفصل تحديداً (لا افتراض ثقة بالدور وحده).
 */
export default async function ScheduleClassPage({
  params,
}: {
  params: { classRoomId: string };
}) {
  const session = await requireSession(["ADMIN", "TEACHER", "PARENT", "STUDENT", "ACCOUNTANT"]);
  const t = await getTranslations("schedule");

  const { role, id: userId } = session.user;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    const related = await isUserRelatedToClassRoom({ role, userId, classRoomId: params.classRoomId });
    if (!related) {
      return (
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-neutral-700">{t("forbidden")}</p>
        </main>
      );
    }
  }

  const classRoom = await prisma.classRoom.findUnique({ where: { id: params.classRoomId } });
  const entries = await getScheduleForClassRoom(params.classRoomId);
  const subjects = role === "ADMIN" ? await listSubjects() : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-xl font-bold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">{classRoom?.name}</p>

      {role === "ADMIN" && (
        <div className="mb-6">
          <CreateScheduleEntryForm classRoomId={params.classRoomId} subjects={subjects} />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p>{t("emptyState")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-2.5 text-start font-medium">{t("day")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{t("time")}</th>
                <th className="px-4 py-2.5 text-start font-medium">{t("subject")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-neutral-900">{t(`days.${entry.dayOfWeek}`)}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {entry.startTime} – {entry.endTime}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{entry.subject.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/" className="mt-6 inline-block text-sm text-neutral-500 hover:text-brand">
        ← 
      </Link>
    </main>
  );
}
