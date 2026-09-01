import { NextRequest } from "next/server";
import crypto from "crypto";
import { apiError, apiSuccess } from "@/lib/api-response";
import { recordGatewayPayment } from "@/modules/financial/service";

/**
 * POST /api/v1/payments/webhook/paytabs
 *
 * ⚠️ ملاحظة صادقة (راجع Rule 3 — لا هلوسة): التحقق من التوقيع أدناه مبني على
 * النمط الوثائقي العام لـPayTabs (حقل "signature" بالـ payload، مقارنة HMAC-SHA256
 * مع Server Key). **هذا يحتاج تحققاً فعلياً مقابل بيئة PayTabs Sandbox حقيقية قبل
 * الإنتاج** — لا يوجد اتصال شبكة بهذه الجلسة للتحقق المباشر من التوثيق الرسمي
 * الحالي. صنّف هذا الجزء NEEDS RESEARCH/NEEDS TESTING بـ STATUS.md.
 */
export async function POST(request: NextRequest) {
  const serverKey = process.env.PAYTABS_SERVER_KEY;
  if (!serverKey) return apiError("VALIDATION_ERROR", "PayTabs غير مُهيّأ بهذه النسخة");

  const rawBody = await request.text();
  const body = JSON.parse(rawBody);

  const receivedSignature = request.headers.get("signature") ?? "";
  const expectedSignature = crypto
    .createHmac("sha256", serverKey)
    .update(rawBody)
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    return apiError("FORBIDDEN", "توقيع غير صالح");
  }

  const { cart_id: invoiceId, cart_amount: amount, respStatus } = body;

  // PayTabs: respStatus "A" = Authorized/Approved — راجع NEEDS TESTING أعلاه
  if (respStatus !== "A") {
    return apiSuccess({ received: true, ignored: true });
  }

  await recordGatewayPayment(invoiceId, Number(amount), "PAYTABS");
  return apiSuccess({ received: true });
}
