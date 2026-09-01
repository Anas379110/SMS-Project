import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { recordGatewayPayment } from "@/modules/financial/service";

/**
 * POST /api/v1/payments/webhook/stripe
 *
 * ⚠️ ملاحظة صادقة: التنفيذ الصحيح والموثوق للتحقق من توقيع Stripe يتطلب مكتبة
 * `stripe` الرسمية (`stripe.webhooks.constructEvent`) لا تحققاً يدوياً مبسّطاً —
 * هذا التحقق أدناه **تبسيطي وغير كافٍ للإنتاج**، مكتوب فقط لإكمال هيكل الـEndpoint.
 * **إلزامي قبل الإنتاج:** تثبيت مكتبة `stripe`، واستبدال هذا التحقق بـ
 * `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`
 * فعلياً، واختباره مقابل Stripe CLI / بيئة اختبار حقيقية. صُنِّف هذا صراحة
 * NEEDS RESEARCH/NEEDS TESTING بـ STATUS.md — لا اعتماد عليه بشكله الحالي.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return apiError("VALIDATION_ERROR", "Stripe غير مُهيّأ بهذه النسخة");

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature") ?? "";

  // تحقق تبسيطي مؤقت فقط — راجع الملاحظة أعلاه قبل أي استخدام إنتاجي
  const isPlausiblySigned = signatureHeader.includes("t=") && signatureHeader.includes("v1=");
  if (!isPlausiblySigned) {
    return apiError("FORBIDDEN", "توقيع غير صالح");
  }

  const event = JSON.parse(rawBody);

  if (event.type !== "checkout.session.completed" && event.type !== "payment_intent.succeeded") {
    return apiSuccess({ received: true, ignored: true });
  }

  const invoiceId = event.data.object.metadata?.invoiceId;
  const amount = (event.data.object.amount_total ?? event.data.object.amount) / 100; // Stripe بالسنت

  if (!invoiceId) return apiError("VALIDATION_ERROR", "invoiceId مفقود بـ metadata");

  await recordGatewayPayment(invoiceId, amount, "STRIPE");
  return apiSuccess({ received: true });
}
