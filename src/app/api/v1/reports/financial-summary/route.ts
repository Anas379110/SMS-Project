import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { getFinancialSummary } from "@/modules/financial/service";

/** GET /api/v1/reports/financial-summary — Admin, Accountant */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية للوصول للتقرير المالي");
  }

  const summary = await getFinancialSummary();
  return apiSuccess(summary);
}
