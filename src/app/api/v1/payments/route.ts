import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { hasRole } from "@/modules/auth/rbac";
import { recordManualPaymentSchema } from "@/modules/financial/schema";
import { recordManualPayment } from "@/modules/financial/service";

/**
 * POST /api/v1/payments — تسجيل دفعة يدوية (Admin, Accountant).
 * راجع DECISIONS.md: هذا المسار إلزامي لسوريا دائماً (لا بوابة آلية بعد)،
 * ومتاح كخطة طوارئ لباقي الدول عند تعطل PayTabs/Stripe.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");
  if (!hasRole(session.user.role, ["ADMIN", "ACCOUNTANT"])) {
    return apiError("FORBIDDEN", "لا صلاحية لتسجيل دفعة");
  }

  const body = await request.json().catch(() => null);
  const parsed = recordManualPaymentSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات الدفعة غير صحيحة");

  try {
    const payment = await recordManualPayment(parsed.data.invoiceId, parsed.data.amount);
    return apiSuccess(payment, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "INVOICE_NOT_FOUND") {
      return apiError("NOT_FOUND", "الفاتورة غير موجودة");
    }
    throw err;
  }
}
