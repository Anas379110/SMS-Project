import { describe, it, expect } from "vitest";
import { computeEffectiveStatus } from "@/modules/financial/service";

/**
 * راجع DECISIONS.md — فجوة اكتُشفت: حالة OVERDUE لم تكن تُفعَّل أبداً بأي منطق
 * كتابة فعلي، ما كان يجعل التقرير المالي يعرض "متأخرة: صفر" دائماً بشكل مضلِّل.
 */
describe("financial/service — computeEffectiveStatus", () => {
  it("marks a PENDING invoice as OVERDUE once its due date has passed", () => {
    const invoice = { status: "PENDING", dueDate: new Date(Date.now() - 86_400_000) };
    expect(computeEffectiveStatus(invoice)).toBe("OVERDUE");
  });

  it("marks a PARTIALLY_PAID invoice as OVERDUE once its due date has passed", () => {
    const invoice = { status: "PARTIALLY_PAID", dueDate: new Date(Date.now() - 1000) };
    expect(computeEffectiveStatus(invoice)).toBe("OVERDUE");
  });

  it("keeps a PENDING invoice as PENDING while still within its due date", () => {
    const invoice = { status: "PENDING", dueDate: new Date(Date.now() + 86_400_000) };
    expect(computeEffectiveStatus(invoice)).toBe("PENDING");
  });

  it("never marks a PAID invoice as OVERDUE, even if the due date has passed", () => {
    const invoice = { status: "PAID", dueDate: new Date(Date.now() - 86_400_000) };
    expect(computeEffectiveStatus(invoice)).toBe("PAID");
  });

  it("never marks a CANCELLED invoice as OVERDUE", () => {
    const invoice = { status: "CANCELLED", dueDate: new Date(Date.now() - 86_400_000) };
    expect(computeEffectiveStatus(invoice)).toBe("CANCELLED");
  });
});
