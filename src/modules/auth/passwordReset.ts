import crypto from "crypto";

const RESET_TOKEN_TTL_MINUTES = 60;

/**
 * راجع DECISIONS.md — Password Reset كانت فجوة موثّقة بـAPI.md بلا تنفيذ فعلي.
 * نستخدم SHA-256 (لا bcrypt) هنا تحديداً لأن bcrypt يولّد Salt عشوائياً بكل
 * استدعاء ولا يسمح بالبحث المباشر بقاعدة البيانات عن الرمز — SHA-256 حتمي
 * (Deterministic) فيسمح بذلك، وهذا مقبول أمنياً لأن الرمز نفسه عشوائي طويل
 * (32 بايت) لا كلمة مرور بشرية يسهل تخمينها.
 */

export function generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  return { token, tokenHash, expiresAt };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isResetTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return expiresAt.getTime() < Date.now();
}
