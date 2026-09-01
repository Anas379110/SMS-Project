import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createFeeStructureSchema } from "@/modules/financial/schema";
import { listFeeStructures, createFeeStructure } from "@/modules/financial/service";

/** GET /api/v1/fee-structures — Admin, Accountant */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية للوصول لبنود الرسوم");
  }

  const items = await listFeeStructures();
  return apiSuccess({ items });
}

/** POST /api/v1/fee-structures — راجع docs/api/API.md — Admin, Accountant */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية لتعريف بند رسوم");
  }

  const body = await request.json().catch(() => null);
  const parsed = createFeeStructureSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات بند الرسوم غير صحيحة");

  const feeStructure = await createFeeStructure(parsed.data);
  return apiSuccess(feeStructure, 201);
}
