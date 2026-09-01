import { z } from "zod";

// راجع docs/requirements/SRS.md (FR-7) و docs/api/API.md

export const createFeeStructureSchema = z.object({
  label: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),
  academicYear: z.string().min(4).max(20),
});
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;

export const createInvoiceSchema = z.object({
  studentId: z.string().cuid(),
  feeStructureId: z.string().cuid(),
  dueDate: z.coerce.date(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

/** تسجيل دفعة يدوية — راجع CLAUDE.md القسم 14: لا معالجة بيانات بطاقة مباشرة بالكود أبداً */
export const recordManualPaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  amount: z.coerce.number().positive(),
});
export type RecordManualPaymentInput = z.infer<typeof recordManualPaymentSchema>;
