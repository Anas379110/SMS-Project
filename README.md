# نظام إدارة المدرسة — School Management System

نسخة White-label مستقلة (True White-label) — راجع `PROJECT.md` و`ARCHITECTURE.md` بجذر المشروع للسياق الكامل قبل أي تطوير.

## المتطلبات
- Node.js 20+
- قاعدة بيانات PostgreSQL (مثال: مشروع Supabase مجاني)

## التثبيت والتشغيل محلياً

```bash
npm install
cp .env.example .env
# املأ DATABASE_URL وNEXTAUTH_SECRET وSCHOOL_COUNTRY وبيانات بوابة الدفع المناسبة بـ .env

npx prisma migrate dev --name init
npx prisma db seed   # ينشئ حساب Admin أولي (راجع الرسالة بالـ Console للبيانات)

npm run dev
# افتح http://localhost:3000 — ستُوجَّه تلقائياً لـ /ar/login أو /en/login
```

## الأوامر
```
npm run dev          تشغيل بيئة التطوير
npm run build         بناء الإنتاج
npm run test          تشغيل الاختبارات (Vitest)
npm run lint           فحص جودة الكود
npm run db:migrate    تطبيق Migration جديد
npm run db:studio     واجهة إدارة بصرية لقاعدة البيانات
```

## الحالة الحالية (Increment 1 — Auth + Branding)
✅ تسجيل دخول (Credentials + JWT + RBAC أساسي)
✅ عرض علامة المدرسة التجارية ديناميكياً (شعار/اسم/لون) بصفحة الدخول
✅ عربي/إنجليزي مع RTL/LTR كامل (next-intl)
✅ اختبارات وحدة: كلمات المرور، تحقق تسجيل الدخول، RBAC

**لم يُبدأ بعد:** إدارة الطلاب/الفصول، الحضور، الدرجات، الجدول، المالي — راجع `STATUS.md` بجذر المشروع للترتيب والتفاصيل الكاملة، و`docs/project/SDLC.md` لترتيب الـ Increments القادمة.

## قبل أي Commit
Hook أمني (`.claude/hooks/pre-commit-secrets-check.sh`) يمنع رفع أي `.env` أو مفتاح API صريح. لا تتجاوزه يدوياً.
