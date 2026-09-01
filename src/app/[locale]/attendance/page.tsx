import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * راجع docs/design/UI-UX.md — Flow: المعلم يسجل الحضور (أهم Flow بالنظام).
 * تُعرض فقط الفصول التي يدرّسها هذا المعلم فعلياً (لا كل فصول المدرسة).
 */
export default async function AttendanceIndexPage() {
  const session = await requireSession(["TEACHER"]);
  const t = await getTranslations("attendance");

  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherUserId: session.user.id },
    include: { classRoom: true },
    distinct: ["classRoomId"],
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("selectClass")}</h1>

      {assignments.length === 0 ? (
        <p className="text-neutral-500">{t("noStudents")}</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {assignments.map((a) => (
            <li key={a.classRoomId}>
              <Link
                href={`/attendance/${a.classRoomId}`}
                className="block px-4 py-3.5 font-medium text-neutral-900 hover:bg-neutral-50"
              >
                {a.classRoom.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
