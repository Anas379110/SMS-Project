import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * راجع docs/database/DATABASE.md القسم 7 (Seed Data):
 * لا بيانات وهمية بالإنتاج — فقط الأدوار (Enum جاهز أصلاً) + حساب Admin أولي
 * + إعدادات مدرسة افتراضية فارغة. يُستخدم هذا السكربت بخطوة 3-4 من
 * .claude/skills/tenant-provisioning/SKILL.md عند إنشاء نسخة عميل جديدة.
 */
async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const schoolName = process.env.SEED_SCHOOL_NAME ?? "مدرستي";
  const country = process.env.SCHOOL_COUNTRY ?? "SA";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      fullName: "Admin",
    },
  });

  const existingSettings = await prisma.schoolSettings.findFirst();
  if (!existingSettings) {
    await prisma.schoolSettings.create({
      data: {
        schoolName,
        country,
        primaryColor: "#1d4ed8",
        defaultLocale: "ar",
      },
    });
  }

  console.log(`✅ Seed مكتمل — حساب Admin: ${adminEmail} (غيّر كلمة المرور فور أول دخول)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
