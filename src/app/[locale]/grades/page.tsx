import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function GradesIndexPage() {
  const session = await requireSession(["TEACHER"]);
  const t = await getTranslations("grades");

  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherUserId: session.user.id },
    include: { classRoom: true, subject: true },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-neutral-900">{t("selectClass")}</h1>

      {assignments.length === 0 ? (
        <p className="text-neutral-500">{t("noClasses")}</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {assignments.map((a) => (
            <li key={a.id}>
              <Link
                href={`/grades/${a.classRoomId}?subjectId=${a.subjectId}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50"
              >
                <span className="font-medium text-neutral-900">{a.classRoom.name}</span>
                <span className="text-sm text-neutral-500">{a.subject.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
