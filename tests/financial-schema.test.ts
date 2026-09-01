import { describe, it, expect } from "vitest";
import {
  createFeeStructureSchema,
  createInvoiceSchema,
  recordManualPaymentSchema,
} from "@/modules/financial/schema";

describe("financial/schema", () => {
  it("createFeeStructureSchema rejects a zero or negative amount", () => {
    expect(
      createFeeStructureSchema.safeParse({ label: "رسوم", amount: 0, academicYear: "2026-2027" })
        .success
    ).toBe(false);
    expect(
      createFeeStructureSchema.safeParse({ label: "رسوم", amount: -100, academicYear: "2026-2027" })
        .success
    ).toBe(false);
  });

  it("createFeeStructureSchema accepts a valid positive amount", () => {
    expect(
      createFeeStructureSchema.safeParse({ label: "رسوم", amount: 500, academicYear: "2026-2027" })
        .success
    ).toBe(true);
  });

  it("createInvoiceSchema requires a valid future-agnostic due date", () => {
    const result = createInvoiceSchema.safeParse({
      studentId: "clx0000000000000000000001",
      feeStructureId: "clx0000000000000000000002",
      dueDate: "2026-09-01",
    });
    expect(result.success).toBe(true);
  });

  it("recordManualPaymentSchema rejects a non-positive amount (protects against accidental zero-value payments)", () => {
    const result = recordManualPaymentSchema.safeParse({
      invoiceId: "clx0000000000000000000001",
      amount: 0,
    });
    expect(result.success).toBe(false);
  });
});
