import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CreateGradeForm } from "@/modules/grades/CreateGradeForm";

/**
 * راجع docs/design/UI-UX.md — رصد الدرجات (Teacher).
 * يُقيَّد الوصول لمعلم هذا الفصل والمادة المحددة تحديداً فقط.
 */
export default async function GradesClassPage({
  params,
  searchParams,
}: {
  params: { classRoomId: string };
  searchParams: { subjectId?: string };
}) {
  const session = await requireSession(["TEACHER"]);
  const t = await getTranslations("grades");

  const subjectId = searchParams.subjectId;

  const assignment = subjectId
    ? await prisma.teacherAssignment.findFirst({
        where: {
          teacherUserId: session.user.id,
          classRoomId: params.classRoomId,
          subjectId,
        },
        include: { classRoom: true, subject: true },
      })
    : null;

  if (!assignment) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-neutral-700">{t("noClasses")}</p>
        <Link href="/grades" className="mt-4 inline-block text-sm text-brand hover:underline">
          ←
        </Link>
      </main>
    );
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classRoomId: params.classRoomId },
    include: { student: true },
    orderBy: { student: { fullName: "asc" } },
  });

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Link href="/grades" className="mb-4 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("selectClass")}
      </Link>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">{t("title")}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {assignment.classRoom.name} — {assignment.subject.name}
      </p>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <CreateGradeForm
          students={enrollments.map((e) => ({ id: e.student.id, fullName: e.student.fullName }))}
          subjectId={subjectId!}
        />
      </div>
    </main>
  );
}
