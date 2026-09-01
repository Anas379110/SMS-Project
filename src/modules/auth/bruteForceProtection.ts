const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

/**
 * راجع DECISIONS.md — حماية من هجمات Brute Force على كلمات المرور، مبنية على
 * PostgreSQL الموجود أصلاً (لا حاجة Redis إضافي بهذه المرحلة — راجع ARCHITECTURE.md
 * القسم 9: لا Caching بلا حاجة مقاسة فعلياً).
 *
 * دوال منطقية بحتة (Pure) قابلة للاختبار بمعزل عن قاعدة البيانات — طبقة الاستدعاء
 * الفعلي بـ src/lib/auth.ts تتكفّل بالقراءة/الكتابة من Prisma.
 */

export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > Date.now();
}

export function computeFailedLoginUpdate(currentFailedAttempts: number): {
  failedLoginAttempts: number;
  lockedUntil: Date | null;
} {
  const newAttempts = currentFailedAttempts + 1;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      failedLoginAttempts: newAttempts,
      lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000),
    };
  }

  return { failedLoginAttempts: newAttempts, lockedUntil: null };
}

export const successfulLoginReset = { failedLoginAttempts: 0, lockedUntil: null as Date | null };
