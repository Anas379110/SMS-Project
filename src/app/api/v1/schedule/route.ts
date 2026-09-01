import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createScheduleEntrySchema } from "@/modules/schedule/schema";
import { createScheduleEntry } from "@/modules/schedule/service";

/** POST /api/v1/schedule — راجع docs/api/API.md — الدور: Admin فقط */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإضافة حصة بالجدول");
  }

  const body = await request.json().catch(() => null);
  const parsed = createScheduleEntrySchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الحصة غير صحيحة");

  const entry = await createScheduleEntry(parsed.data);
  return apiSuccess(entry, 201);
}
