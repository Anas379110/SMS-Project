import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api-response";
import { confirmPasswordResetSchema } from "@/modules/auth/passwordResetSchema";
import { hashResetToken, isResetTokenExpired } from "@/modules/auth/passwordReset";
import { hashPassword } from "@/modules/auth/password";
import { successfulLoginReset } from "@/modules/auth/bruteForceProtection";

/** POST /api/v1/auth/reset-password/confirm */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = confirmPasswordResetSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "بيانات غير صحيحة");

  const tokenHash = hashResetToken(parsed.data.token);
  const user = await prisma.user.findFirst({ where: { resetTokenHash: tokenHash } });

  if (!user || isResetTokenExpired(user.resetTokenExpiresAt)) {
    // رسالة عامة موحّدة — لا كشف إن كان السبب رمزاً غير موجود أو منتهي الصلاحية
    return apiError("VALIDATION_ERROR", "الرابط غير صالح أو منتهي الصلاحية");
  }

  const newPasswordHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      // إعادة تعيين كلمة المرور تُعتبر أيضاً فرصة جيدة لتصفير أي قفل Brute Force متبقٍ
      ...successfulLoginReset,
    },
  });

  return apiSuccess({ message: "تم تحديث كلمة المرور بنجاح" });
}
