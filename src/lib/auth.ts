import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/modules/auth/schema";
import { verifyPassword } from "@/modules/auth/password";
import {
  isAccountLocked,
  computeFailedLoginUpdate,
  successfulLoginReset,
} from "@/modules/auth/bruteForceProtection";

/**
 * راجع CLAUDE.md القسم 10: لا كشف أي معلومة تفصح إن كان البريد أم كلمة المرور
 * هي الخاطئة تحديداً — رسالة خطأ موحّدة دائماً.
 */
export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    // 8 ساعات بدل الافتراضي (30 يوماً) — راجع DECISIONS.md: يقلل نافذة خطر
    // استمرار صلاحية مستخدم أُوقف حسابه أو تغيّر دوره أثناء صلاحية Token قديم
    // (خطر متبقٍ يحتاج حلاً معمارياً كاملاً لاحقاً — راجع القرار الموثّق).
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        // نفس الرسالة الموحّدة تُستخدم بالواجهة سواء المستخدم غير موجود أو
        // البيانات خاطئة أو الحساب مقفل — لا كشف أي تفصيل لمهاجم محتمل
        if (!user || !user.isActive) return null;

        if (isAccountLocked(user.lockedUntil)) return null;

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          const update = computeFailedLoginUpdate(user.failedLoginAttempts);
          await prisma.user.update({ where: { id: user.id }, data: update });
          return null;
        }

        // نجاح الدخول — إعادة تصفير عدّاد المحاولات الفاشلة إن كان أي منها مسجلاً
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({ where: { id: user.id }, data: successfulLoginReset });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { role?: string; id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
