import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/session";
import { listClassRooms } from "@/modules/academic/service";
import { CreateClassRoomForm } from "@/modules/academic/CreateClassRoomForm";

export default async function ClassRoomsPage() {
  const session = await requireSession(["ADMIN", "TEACHER"]);
  const t = await getTranslations("classrooms");
  const common = await getTranslations("common");

  const classRooms = await listClassRooms();
  const canAdd = session.user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">{t("title")}</h1>
      </div>

      {canAdd && (
        <div className="mb-6">
          <CreateClassRoomForm />
        </div>
      )}

      {classRooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <p>{t("emptyState")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {classRooms.map((classRoom) => (
            <li key={classRoom.id}>
              <Link
                href={`/classrooms/${classRoom.id}`}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50"
              >
                <span className="font-medium text-neutral-900">{classRoom.name}</span>
                <span className="text-sm text-neutral-500">{classRoom.academicYear}</span>
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
