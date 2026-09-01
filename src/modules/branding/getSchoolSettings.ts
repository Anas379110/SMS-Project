import { prisma } from "@/lib/prisma";

/**
 * راجع ARCHITECTURE.md القسم 2 (Branding Module) — صف واحد فقط بكل قاعدة بيانات
 * (نسخة واحدة = مدرسة واحدة، True White-label). يُقرأ عند كل تحميل واجهة عامة
 * (صفحة الدخول) وبعد الدخول (Layout الرئيسي).
 */
export async function getSchoolSettings() {
  const settings = await prisma.schoolSettings.findFirst();

  // قيم افتراضية آمنة إن لم تُهيَّأ الإعدادات بعد (أول تشغيل بعد Provisioning)
  return (
    settings ?? {
      id: "default",
      schoolName: "School",
      logoUrl: null,
      primaryColor: "#1d4ed8",
      country: "SA",
      defaultLocale: "ar",
      updatedAt: new Date(),
    }
  );
}
