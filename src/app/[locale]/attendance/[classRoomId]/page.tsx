import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAttendanceSheet } from "@/modules/attendance/service";
import { AttendanceSheet } from "@/modules/attendance/AttendanceSheet";

/**
 * راجع docs/design/UI-UX.md — يُقيَّد الوصول لفصل هذا المعلم تحديداً فقط
 * (لا يكفي دوره Teacher — يجب أن يكون مسؤولاً فعلياً عن هذا الفصل بالذات).
 */
export default async function AttendanceClassPage({
  params,
}: {
  params: { classRoomId: string };
}) {
  const session = await requireSession(["TEACHER"]);
  const t = await getTranslations("attendance");

  const assignment = await prisma.teacherAssignment.findFirst({
    where: { teacherUserId: session.user.id, classRoomId: params.classRoomId },
    include: { classRoom: true },
  });

  if (!assignment) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-neutral-700">{t("forbidden")}</p>
        <Link href="/attendance" className="mt-4 inline-block text-sm text-brand hover:underline">
          ←
        </Link>
      </main>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateString = today.toISOString().split("T")[0];

  const rows = await getAttendanceSheet(params.classRoomId, today);

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/attendance" className="mb-4 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("selectClass")}
      </Link>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">
        {t("title")} — {assignment.classRoom.name}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        {t("date")}: {today.toLocaleDateString()}
      </p>

      <AttendanceSheet classRoomId={params.classRoomId} initialRows={rows} date={dateString} />
    </main>
  );
}
