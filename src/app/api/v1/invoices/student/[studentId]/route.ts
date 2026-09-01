import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { canAccessStudent } from "@/modules/auth/rbac";
import { getStudentAccessInfo } from "@/modules/academic/service";
import { getInvoicesForStudent } from "@/modules/financial/service";
import type { Role } from "@prisma/client";

type Params = { params: { studentId: string } };

/**
 * GET /api/v1/invoices/student/:studentId — راجع docs/api/API.md
 * الأدوار: Admin, Accountant, Parent (لأبنائه فقط) — لا Teacher هنا (بيانات مالية
 * ليست من اختصاصه، بخلاف الحضور/الدرجات).
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "يجب تسجيل الدخول");

  const role = session.user.role as Role;
  const userId = session.user.id;

  if (role !== "ADMIN" && role !== "ACCOUNTANT") {
    const { guardianUserId, ownUserId } = await getStudentAccessInfo(params.studentId);

    const allowed = canAccessStudent({
      requesterRole: role,
      requesterUserId: userId,
      studentGuardianUserId: guardianUserId,
      studentOwnUserId: ownUserId,
      // Teacher يُستثنى صراحة من الوصول المالي حتى لو كان مسؤولاً عن الطالب أكاديمياً
      isTeacherOfStudent: role === "TEACHER" ? false : undefined,
    });

    if (!allowed) return apiError("FORBIDDEN", "لا صلاحية للوصول لفواتير هذا الطالب");
  }

  const invoices = await getInvoicesForStudent(params.studentId);
  return apiSuccess({ items: invoices });
}
