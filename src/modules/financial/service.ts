import { prisma } from "@/lib/prisma";
import type {
  CreateFeeStructureInput,
  CreateInvoiceInput,
} from "@/modules/financial/schema";

// راجع docs/requirements/SRS.md (FR-7) و CLAUDE.md القسم 8

/**
 * راجع DECISIONS.md — فجوة اكتُشفت بمراجعة ذاتية: حالة OVERDUE معرّفة بـSchema
 * ومُستخدمة بالتقرير المالي، لكن لا يوجد أي Cron Job أو منطق يفعّلها (لا حاجة
 * وظيفة خلفية إضافية بهذه المرحلة — راجع ARCHITECTURE.md القسم 10: لا تعقيد
 * إضافي بلا حاجة مقاسة). الحل: حساب الحالة الفعلية "عند القراءة" (Computed at
 * read-time) بدل الاعتماد فقط على الحقل المخزّن الثابت.
 */
export function computeEffectiveStatus<T extends { status: string; dueDate: Date }>(
  invoice: T
): T["status"] | "OVERDUE" {
  const isPastDue = invoice.dueDate.getTime() < Date.now();
  const isUnsettled = invoice.status === "PENDING" || invoice.status === "PARTIALLY_PAID";
  return isPastDue && isUnsettled ? "OVERDUE" : invoice.status;
}

export async function listFeeStructures() {
  return prisma.feeStructure.findMany({ orderBy: { academicYear: "desc" } });
}

export async function createFeeStructure(input: CreateFeeStructureInput) {
  return prisma.feeStructure.create({ data: input });
}

export async function createInvoice(input: CreateInvoiceInput) {
  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: input.feeStructureId },
  });
  if (!feeStructure) throw new Error("FEE_STRUCTURE_NOT_FOUND");

  const invoice = await prisma.invoice.create({
    data: {
      studentId: input.studentId,
      feeStructureId: input.feeStructureId,
      dueDate: input.dueDate,
      amount: feeStructure.amount,
      status: "PENDING",
    },
  });

  // راجع DECISIONS.md — FR-8.1 يتطلب إشعاراً عند إصدار فاتورة جديدة، كان مفقوداً
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { guardian: true },
  });

  if (student?.guardian?.userId) {
    await prisma.notification.create({
      data: {
        userId: student.guardian.userId,
        type: "NEW_INVOICE",
        message: `فاتورة جديدة لـ ${student.fullName}: ${feeStructure.label} — ${invoice.amount}`,
      },
    });
  }

  return invoice;
}

export async function getInvoicesForStudent(studentId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { studentId },
    include: { feeStructure: true, payments: true },
    orderBy: { dueDate: "desc" },
  });

  // تُحسب حالة "متأخرة" ديناميكياً بالعرض — راجع computeEffectiveStatus أعلاه
  return invoices.map((invoice) => ({
    ...invoice,
    status: computeEffectiveStatus(invoice),
  }));
}

/**
 * تسجيل دفعة يدوية (Admin/Accountant) — يُستخدم لسوريا دائماً، ولباقي الدول
 * كخطة طوارئ إن تعطلت بوابة الدفع الآلية (راجع ARCHITECTURE.md — نقاط الفشل).
 * يحدّث حالة الفاتورة فوراً بعد التسجيل (FR-7.3).
 */
export async function recordManualPayment(invoiceId: string, amount: number) {
  return applyPaymentToInvoice(invoiceId, amount, "MANUAL");
}

/** يُستدعى من Webhooks بوابات الدفع الآلية (PayTabs/Stripe) بعد التحقق من التوقيع */
export async function recordGatewayPayment(
  invoiceId: string,
  amount: number,
  method: "PAYTABS" | "STRIPE"
) {
  return applyPaymentToInvoice(invoiceId, amount, method);
}

async function applyPaymentToInvoice(
  invoiceId: string,
  amount: number,
  method: "PAYTABS" | "STRIPE" | "MANUAL"
) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");

    const payment = await tx.payment.create({
      data: { invoiceId, amount, method },
    });

    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;

    const newStatus =
      totalPaid >= invoice.amount
        ? "PAID"
        : totalPaid > 0
          ? "PARTIALLY_PAID"
          : "PENDING";

    await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });

    return payment;
  });
}

/**
 * تقرير مالي مبسّط — راجع FR-7.4.
 * راجع الملاحظة أعلى computeEffectiveStatus: "متأخرة" ليست حقلاً مخزَّناً
 * يُحدَّث تلقائياً، لذا تُحسب هنا بجلب كل الفواتير غير المسدَّدة (PENDING/
 * PARTIALLY_PAID) وتصنيفها فعلياً حسب dueDate بدل استعلام status مباشر
 * (الذي لن يُرجع شيئاً لأن لا كتابة فعلية لقيمة OVERDUE بقاعدة البيانات).
 */
export async function getFinancialSummary() {
  const [paidAgg, unsettledInvoices] = await Promise.all([
    prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.invoice.findMany({
      where: { status: { in: ["PENDING", "PARTIALLY_PAID"] } },
      select: { amount: true, status: true, dueDate: true },
    }),
  ]);

  const now = Date.now();
  const buckets = {
    pending: { count: 0, total: 0 },
    partiallyPaid: { count: 0, total: 0 },
    overdue: { count: 0, total: 0 },
  };

  for (const invoice of unsettledInvoices) {
    const isOverdue = invoice.dueDate.getTime() < now;
    const bucket = isOverdue
      ? buckets.overdue
      : invoice.status === "PENDING"
        ? buckets.pending
        : buckets.partiallyPaid;

    bucket.count += 1;
    bucket.total += invoice.amount;
  }

  return {
    pending: buckets.pending,
    partiallyPaid: buckets.partiallyPaid,
    overdue: buckets.overdue,
    paid: { count: paidAgg._count, total: paidAgg._sum.amount ?? 0 },
  };
}
