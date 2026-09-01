import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { getClassRoomWithStudents, getUnenrolledStudents, listTeachers, getTeacherAssignmentsForClassRoom } from "@/modules/academic/service";
import { listSubjects } from "@/modules/grades/service";
import { EnrollStudentControl } from "@/modules/academic/EnrollStudentControl";
import { AssignTeacherControl } from "@/modules/academic/AssignTeacherControl";
import { AddSubjectControl } from "@/modules/academic/AddSubjectControl";

/**
 * راجع DECISIONS.md — هذه الصفحة تسدّ فجوة وظيفية كانت تمنع أي استخدام فعلي
 * للنظام: كانت هناك طريقة لإنشاء طلاب وفصول منفصلَين، لكن لا واجهة لربطهما.
 */
export default async function ClassRoomDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession(["ADMIN", "TEACHER"]);
  const t = await getTranslations("students");
  const enrollT = await getTranslations("enrollments");
  const assignT = await getTranslations("teacherAssignments");

  const data = await getClassRoomWithStudents(params.id);
  if (!data) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-neutral-700">{t("notFound")}</p>
      </main>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const unenrolled = isAdmin ? await getUnenrolledStudents(params.id) : [];
  const [teachers, subjects, currentAssignments] = isAdmin
    ? await Promise.all([
        listTeachers(),
        listSubjects(),
        getTeacherAssignmentsForClassRoom(params.id),
      ])
    : [[], [], []];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/classrooms" className="mb-4 inline-block text-sm text-neutral-500 hover:text-brand">
        ← {t("backToList")}
      </Link>
      <h1 className="mb-1 text-xl font-bold text-neutral-900">{data.classRoom.name}</h1>
      <p className="mb-6 text-sm text-neutral-500">{data.classRoom.academicYear}</p>

      {isAdmin && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">{assignT("manageTeachers")}</h2>
          <AddSubjectControl />
          <AssignTeacherControl
            classRoomId={params.id}
            teachers={teachers.map((tt) => ({ id: tt.id, label: `${tt.fullName} (${tt.email})` }))}
            subjects={subjects.map((s) => ({ id: s.id, label: s.name }))}
          />
          {currentAssignments.length > 0 && (
            <ul className="mb-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white text-sm">
              {currentAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-neutral-700">{a.teacher.fullName}</span>
                  <span className="text-neutral-500">{a.subject.name}</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mb-2 text-sm font-semibold text-neutral-700">{enrollT("manageRoster")}</h2>
          <EnrollStudentControl classRoomId={params.id} availableStudents={unenrolled} />
        </>
      )}

      {data.students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p>{t("emptyState")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {data.students.map((student) => (
            <li key={student.id} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-medium text-neutral-900">{student.fullName}</span>
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
    </main>
  );
}
