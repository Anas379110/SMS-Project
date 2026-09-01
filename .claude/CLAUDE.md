# CLAUDE.md — PROJECT BRAIN FOR CLAUDE

## 1. Project Overview
نظام إدارة مدارس **True White-label** — نسخة منفصلة فعلياً (تطبيق + قاعدة بيانات مستقلة) تُنشر لكل مدرسة عميلة. النموذج: **MLP** (جودة تجربة عالية من الإصدار الأول، لا مجرد إثبات فكرة). السوق: خليج + سوريا + العراق + UK + US. عربي/إنجليزي كامل بدعم RTL/LTR.

**اقرأ `PROJECT.md` قبل أي تخطيط جديد.**

## 2. Current Phase
Gate: AI Tooling Setup (هذه المرحلة) — التطوير الفعلي لم يبدأ بعد. راجع `STATUS.md` دائماً لمعرفة آخر تحديث حقيقي للحالة — **لا تفترض حالة المشروع من ذاكرتك، اقرأ STATUS.md بكل جلسة جديدة.**

## 3. Architecture
**اقرأ `ARCHITECTURE.md` قبل أي تغيير معماري.**
ملخص: **Modular Monolith** — Next.js Full-stack (مشروع واحد Frontend+Backend)، لا Microservices. كل نسخة عميل = تطبيق مستقل + قاعدة بيانات مستقلة (True White-label). الوحدات الداخلية: Auth, Branding, Academic, Attendance, Grades, Schedule, Financial, Notification.

## 4. Tech Stack
**اقرأ `TECH-STACK.md` للتفصيل الكامل.**
Next.js (TypeScript) + Tailwind/shadcn + next-intl + NextAuth.js + Zod + Prisma + PostgreSQL (Supabase Free Tier) + Vercel + PayTabs (خليج+عراق) / Stripe (UK/US) / يدوي (سوريا).

## 5. Database
**اقرأ `docs/database/DATABASE.md` و`docs/database/ERD.mmd` قبل أي تغيير بقاعدة البيانات.**
لا Tenant ID بالجداول — العزل فيزيائي (كل نسخة قاعدة بياناتها الخاصة). كل Migration عبر Prisma Migrate فقط، واستراتيجية Expand→Migrate→Contract للتغييرات الخطرة.

## 6. API
**اقرأ `docs/api/API.md`.** REST، `/api/v1/`، JSON، أخطاء موحّدة `{error:{code,message}}`. كل Endpoint يتحقق من RBAC قبل التنفيذ دون استثناء.

## 7. Project Structure
```
/                       ← جذر المشروع (Deployment Template — يُكرَّر لكل عميل)
├── src/
│   ├── app/            ← Next.js App Router (صفحات + API Routes)
│   ├── components/     ← مكونات UI فقط، لا Business Logic هنا
│   ├── modules/         ← منطق كل وحدة (auth/, academic/, attendance/, grades/, financial/...)
│   ├── lib/             ← أدوات مشتركة (prisma client, auth config, i18n)
│   └── types/            ← أنواع TypeScript المشتركة
├── prisma/              ← schema.prisma + migrations
├── messages/            ← next-intl (ar.json, en.json) — لا نص Hardcoded بالكود أبداً
├── database/seeds/
├── docs/                 ← كل وثائق التخطيط (لا تُعدَّل بدون تحديث DECISIONS.md عند تغيير قرار)
└── .claude/ .env.example .gitignore
```

## 8. Coding Rules (لا تخالفها)
- TypeScript Strict Mode — لا `any` أبداً
- كل نص بالواجهة عبر next-intl (`messages/ar.json` و`messages/en.json`) — **ممنوع نص Hardcoded مطلقاً** (قرار مؤكد بـ DECISIONS.md بسبب i18n الإلزامي)
- كل Endpoint: Zod Validation أولاً، RBAC ثانياً، منطق العمل ثالثاً
- Functional Components فقط (React) — لا Class Components
- Business Logic بـ `src/modules/`، لا بمكونات UI

## 9. Testing Rules
**اقرأ `TESTING.md` قبل تعديل أي اختبار** (يُنشأ رسمياً عند بداية Gate Development — راجع STATUS.md لمعرفة إن كان موجوداً بعد). حتى إنشائه: كل Feature تحتاج Unit Test على الأقل لمنطق العمل الحساس (خصوصاً Financial وAttendance).

## 10. Security Rules
- لا secrets بالكود أبداً — استخدم `.env` فقط (غير مرفوع لـ Git)
- كل استعلام يتحقق من صلاحية الدور فعلياً بالـ Backend، لا بإخفاء عناصر Frontend فقط
- ولي الأمر يرى فقط بيانات أبنائه — تحقق صريح بكل Endpoint يعيد بيانات طالب
- بيانات القاصرين (Student) حساسة — لا تخزين معلومات غير ضرورية (راجع DATABASE.md القسم 8)
- كلمات المرور: bcrypt/argon2 فقط، لا نص صريح أبداً

## 11. Git Rules
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- فروع: `main` (إنتاج) / `develop` / `feature/*` / `fix/*`
- لا دفع مباشر لـ `main`

## 12. Documentation Rules
أي تغيير معماري/قاعدة بيانات/API/Tech Stack يُحدَّث فوراً بـ `DECISIONS.md` — لا قرار صامت بالكود يخالف الوثائق دون تسجيل.

## 13. Commands
```
dev:    npm run dev
build:  npm run build
test:   npm run test
lint:   npm run lint
db:migrate:  npx prisma migrate dev
db:studio:   npx prisma studio
```
(تُحدَّث فور إنشاء `package.json` الفعلي بأول Task تطوير)

## 14. Forbidden Practices
- لا Microservices أو Redis/Queue خارجي بدون حاجة مقاسة فعلياً (Rule 65 — عدم الإفراط الهندسي)
- لا نص Hardcoded بأي واجهة
- لا معالجة بيانات بطاقة دفع مباشرة بالكود — فقط عبر PayTabs/Stripe SDK/Webhook
- لا حذف فعلي لبيانات طالب (Soft Delete/أرشفة فقط)
- لا تغيير قرار مسجّل بـ DECISIONS.md دون تسجيل قرار جديد يوضح السبب

## 15. Definition of Done (لكل Task)
- الكود مكتوب ومطابق لقواعد القسم 8
- Unit Test على الأقل للمنطق الحساس
- لا نص Hardcoded (تحقق يدوي أو عبر أداة Skill `i18n-rtl-check`)
- RBAC مُتحقق منه بكل Endpoint جديد
- توثيق محدَّث إن تغيّر شيء بـ API.md/DATABASE.md/DECISIONS.md
- Commit بصيغة Conventional Commits

---

**تذكير أساسي:** المصدر الحقيقي للمشروع هو Repository + Documentation + Code + Tests — وليس ذاكرتك كـ Claude. إذا انتهت الجلسة، أي جلسة جديدة يجب أن تبدأ بقراءة `STATUS.md` و`DECISIONS.md` أولاً قبل أي عمل.
