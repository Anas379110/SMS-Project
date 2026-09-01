import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * راجع DECISIONS.md — Security Review الذاتي بتاريخ 2026-08-19 اكتشف أن التحقق
 * الأصلي بـ POST /api/v1/attendance كان يتحقق فقط من أول طالب بالقائمة، ما كان
 * يسمح نظرياً بحقن studentId من فصل آخر ضمن نفس الطلب الدفعي دون رفضه.
 * هذا الاختبار يوثّق منطق الإصلاح (validateTeacherBatchForClassRoom) على مستوى
 * الوحدة، عبر محاكاة استجابات Prisma بدل الاتصال بقاعدة بيانات فعلية.
 */

vi.mock("@/lib/prisma", () => ({
  prisma: {
    teacherAssignment: { count: vi.fn() },
    enrollment: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { validateTeacherBatchForClassRoom } from "@/modules/academic/service";

describe("academic/service — validateTeacherBatchForClassRoom (regression test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the teacher is not assigned to the class at all", async () => {
    (prisma.teacherAssignment.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await validateTeacherBatchForClassRoom({
      teacherUserId: "t1",
      classRoomId: "c1",
      studentIds: ["s1", "s2"],
    });

    expect(result).toBe(false);
    expect(prisma.enrollment.count).not.toHaveBeenCalled();
  });

  it("rejects when at least one student does not belong to the class (the fixed vulnerability)", async () => {
    (prisma.teacherAssignment.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    // فقط طالب واحد من أصل 2 فعلياً مسجّل بالفصل — يجب الرفض بالكامل
    (prisma.enrollment.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await validateTeacherBatchForClassRoom({
      teacherUserId: "t1",
      classRoomId: "c1",
      studentIds: ["s1", "s2-from-another-class"],
    });

    expect(result).toBe(false);
  });

  it("accepts when the teacher is assigned and every student belongs to the class", async () => {
    (prisma.teacherAssignment.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    (prisma.enrollment.count as ReturnType<typeof vi.fn>).mockResolvedValue(2);

    const result = await validateTeacherBatchForClassRoom({
      teacherUserId: "t1",
      classRoomId: "c1",
      studentIds: ["s1", "s2"],
    });

    expect(result).toBe(true);
  });

  it("rejects an empty student list without querying the database", async () => {
    const result = await validateTeacherBatchForClassRoom({
      teacherUserId: "t1",
      classRoomId: "c1",
      studentIds: [],
    });

    expect(result).toBe(false);
    expect(prisma.teacherAssignment.count).not.toHaveBeenCalled();
  });
});
