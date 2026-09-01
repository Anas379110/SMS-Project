/**
 * راجع DECISIONS.md — "بوابات الدفع النهائية لكل دولة" (بحث فعلي بتاريخ 2026-08-11):
 * خليج + العراق → PayTabs | UK/US → Stripe | سوريا → يدوي فقط بهذا الإصدار.
 * نقطة واحدة لهذا القرار — لا تُكرَّر قائمة الدول بأكثر من مكان بالكود.
 */

const PAYTABS_COUNTRIES = ["SA", "AE", "KW", "QA", "BH", "OM", "IQ"];
const STRIPE_COUNTRIES = ["GB", "US"];
const MANUAL_ONLY_COUNTRIES = ["SY"];

export type PaymentMethodOption = "PAYTABS" | "STRIPE" | "MANUAL";

export function getPaymentMethodForCountry(countryCode: string): PaymentMethodOption {
  const code = countryCode.toUpperCase();

  if (PAYTABS_COUNTRIES.includes(code)) return "PAYTABS";
  if (STRIPE_COUNTRIES.includes(code)) return "STRIPE";
  if (MANUAL_ONLY_COUNTRIES.includes(code)) return "MANUAL";

  // دولة غير متوقعة بالنطاق الحالي (راجع DECISIONS.md للدول الثمانية المعتمدة)
  // — نُرجع MANUAL كخيار آمن افتراضي بدل الفشل الصامت أو افتراض بوابة خاطئة
  return "MANUAL";
}
