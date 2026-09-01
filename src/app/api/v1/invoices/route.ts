import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { createInvoiceSchema } from "@/modules/financial/schema";
import { createInvoice } from "@/modules/financial/service";

/** POST /api/v1/invoices — راجع docs/api/API.md — Admin, Accountant */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية لإصدار فاتورة");
  }

  const body = await request.json().catch(() => null);
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الفاتورة غير صحيحة");

  try {
    const invoice = await createInvoice(parsed.data);
    return apiSuccess(invoice, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "FEE_STRUCTURE_NOT_FOUND") {
      return apiError("VALIDATION_ERROR", "بند الرسوم المحدد غير موجود");
    }
    throw err;
  }
}
