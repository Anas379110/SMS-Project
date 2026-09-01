import { describe, it, expect } from "vitest";
import { getPaymentMethodForCountry } from "@/modules/financial/payment-routing";

/**
 * راجع DECISIONS.md — هذا الاختبار يحمي أهم قرار بحثي بالمشروع: خليج+العراق
 * عبر PayTabs، UK/US عبر Stripe، وسوريا يدوي فقط. أي تعديل مستقبلي بهذا الجدول
 * بدون تحديث هذا الاختبار يعني تناقضاً بين الكود والقرار الموثّق.
 */
describe("financial/payment-routing", () => {
  it("routes Gulf countries to PayTabs", () => {
    expect(getPaymentMethodForCountry("SA")).toBe("PAYTABS");
    expect(getPaymentMethodForCountry("AE")).toBe("PAYTABS");
    expect(getPaymentMethodForCountry("KW")).toBe("PAYTABS");
    expect(getPaymentMethodForCountry("QA")).toBe("PAYTABS");
    expect(getPaymentMethodForCountry("BH")).toBe("PAYTABS");
    expect(getPaymentMethodForCountry("OM")).toBe("PAYTABS");
  });

  it("routes Iraq to PayTabs (research finding — not manual, unlike the initial assumption)", () => {
    expect(getPaymentMethodForCountry("IQ")).toBe("PAYTABS");
  });

  it("routes UK and US to Stripe", () => {
    expect(getPaymentMethodForCountry("GB")).toBe("STRIPE");
    expect(getPaymentMethodForCountry("US")).toBe("STRIPE");
  });

  it("routes Syria to manual settlement only", () => {
    expect(getPaymentMethodForCountry("SY")).toBe("MANUAL");
  });

  it("falls back to manual for an unexpected country code instead of failing silently", () => {
    expect(getPaymentMethodForCountry("XX")).toBe("MANUAL");
  });

  it("is case-insensitive", () => {
    expect(getPaymentMethodForCountry("sa")).toBe("PAYTABS");
  });
});
