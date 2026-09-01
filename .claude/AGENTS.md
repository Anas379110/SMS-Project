# AGENTS.md

## Project Overview
نظام إدارة مدارس **True White-label** — نسخة منفصلة فعلياً (تطبيق + قاعدة بيانات مستقلة) تُنشر لكل مدرسة عميلة. النموذج: **MLP**. السوق: خليج + سوريا + العراق + UK + US. عربي/إنجليزي كامل بدعم RTL/LTR.

اقرأ `PROJECT.md` و`STATUS.md` (لحالة المشروع الفعلية الحالية) قبل أي عمل.

## Architecture
Modular Monolith — Next.js Full-stack (مشروع واحد). لا Microservices. كل نسخة عميل = تطبيق + قاعدة بيانات مستقلة بالكامل. الوحدات: Auth, Branding, Academic, Attendance, Grades, Schedule, Financial, Notification. التفصيل: `ARCHITECTURE.md`.

## Tech Stack
Next.js (TypeScript) + Tailwind/shadcn + next-intl + NextAuth.js + Zod + Prisma + PostgreSQL (Supabase) + Vercel + PayTabs (خليج+عراق) / Stripe (UK/US) / يدوي (سوريا). التفصيل: `TECH-STACK.md`.

## Directory Structure
```
src/app/          Next.js App Router (صفحات + API Routes)
src/components/    مكونات UI فقط
src/modules/       منطق الأعمال لكل وحدة
src/lib/           أدوات مشتركة
src/types/         أنواع TypeScript
prisma/            schema + migrations
messages/          next-intl (ar.json, en.json)
docs/              كل وثائق التخطيط
```

## Commands
```
npm run dev
npm run build
npm run test
npm run lint
npx prisma migrate dev
```

## Database Rules
لا Tenant ID بالجداول (عزل فيزيائي بحكم True White-label). Migration عبر Prisma Migrate فقط. تغييرات خطرة: Expand→Migrate→Contract. راجع `docs/database/DATABASE.md`.

## API Rules
REST تحت `/api/v1/`. كل Endpoint: Zod Validation ثم RBAC ثم منطق العمل. أخطاء موحّدة. راجع `docs/api/API.md`.

## Coding Rules
- TypeScript Strict — لا `any`
- لا نص Hardcoded — كل شيء عبر next-intl
- Functional Components فقط
- Business Logic بـ `src/modules/` فقط

## Testing
راجع `TESTING.md` عند إنشائه (Gate Development). حتى ذلك الحين: Unit Test إلزامي لمنطق Financial وAttendance تحديداً.

## Security
- لا secrets بالكود — `.env` فقط
- RBAC حقيقي بالـ Backend لكل Endpoint، لا إخفاء Frontend فقط
- ولي الأمر يرى بيانات أبنائه فقط — تحقق صريح إلزامي
- كلمات المرور: bcrypt/argon2

## Git
Conventional Commits (`feat:`, `fix:`, `docs:`...). فروع: `main`/`develop`/`feature/*`/`fix/*`. لا دفع مباشر لـ `main`.

## Documentation
أي تغيير معماري/DB/API يُحدَّث فوراً بـ `DECISIONS.md`.

## Definition of Done
كود مطابق للقواعد + Unit Test للمنطق الحساس + لا نص Hardcoded + RBAC مُتحقق + توثيق محدَّث + Commit صحيح.

## Forbidden Actions
- Microservices/Redis/Queue بدون حاجة مقاسة فعلياً
- نص Hardcoded بأي واجهة
- معالجة بيانات بطاقة دفع مباشرة (فقط عبر PayTabs/Stripe SDK/Webhook)
- حذف فعلي لبيانات طالب (Soft Delete فقط)
- تغيير قرار بـ DECISIONS.md دون تسجيل قرار جديد موثّق

---
المصدر الحقيقي: Repository + Documentation + Code + Tests. اقرأ `STATUS.md` و`DECISIONS.md` بداية كل جلسة عمل جديدة.
