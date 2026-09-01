import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createClassRoomSchema } from "@/modules/academic/schema";
import { listClassRooms, createClassRoom } from "@/modules/academic/service";

/** GET /api/v1/classrooms — Admin, Teacher */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "TEACHER"])) {
    return apiError("FORBIDDEN", "لا صلاحية للوصول لهذا المورد");
  }

  const classRooms = await listClassRooms();
  return apiSuccess({ items: classRooms });
}

/** POST /api/v1/classrooms — Admin فقط */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإنشاء فصل دراسي");
  }

  const body = await request.json().catch(() => null);
  const parsed = createClassRoomSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الفصل غير صحيحة");

  const classRoom = await createClassRoom(parsed.data);
  return apiSuccess(classRoom, 201);
}
