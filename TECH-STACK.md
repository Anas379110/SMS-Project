# TECH-STACK.md

## معايير الاختيار (راجع القسم 16 بالتعليمات الأساسية)
الأولوية هنا: **سرعة إطلاق MLP خلال 3 أشهر + سهولة تكرار Provisioning لكل عميل جديد + Free Tier فعلي متاح + i18n/RTL ناضج + مطور فردي/فريق صغير**.

---

## Frontend

| القرار | الخيار | لماذا | البدائل المرفوضة |
|---|---|---|---|
| **Framework** | **Next.js (TypeScript)** | SSR جاهز (SEO مفيد لصفحة تسجيل دخول عامة لكل مدرسة)، نظام Routing وi18n مدمج (`next-intl`)، نفس اللغة مع Backend إن استُخدم API Routes، توثيق ضخم يسرّع فريقاً صغيراً | Vue/Nuxt (نظام بيئي أصغر لمكتبات RTL الجاهزة)؛ Angular (ثقيل لفريق صغير وجدول ضيق) |
| **UI** | **Tailwind CSS + shadcn/ui** | تحكم كامل بالتصميم بدون إعادة اختراع، دعم RTL عبر `dir` attribute بسيط نسبياً مع Tailwind | Material UI (أثقل، دعم RTL أقل مرونة) |
| **State Management** | **React Context + hooks بسيطة** (لا Redux) | حجم التطبيق لا يبرر Redux — بيانات كل نسخة محدودة ومباشرة | Redux/Zustand (إفراط هندسي بهذا الحجم مبدئياً؛ يُضاف لاحقاً إن ظهرت حاجة فعلية) |
| **Forms/Validation** | **React Hook Form + Zod** | تحقق موحّد Frontend/Backend (نفس Schema يمكن مشاركته) | Formik (أقل نشاطاً بالصيانة حالياً) |
| **i18n** | **next-intl** | يدعم عربي/إنجليزي وRTL/LTR ديناميكي بشكل ناضج مع Next.js تحديداً | react-i18next (يحتاج إعداداً يدوياً أكبر مع Next.js App Router) |

## Backend

| القرار | الخيار | لماذا | البدائل المرفوضة |
|---|---|---|---|
| **Language/Framework** | **Next.js API Routes (نفس مشروع الـ Frontend) + TypeScript** | **الأهم لهذا المشروع تحديداً:** مستودع واحد فقط (Frontend+Backend) يُكرَّر كاملاً لكل نسخة عميل بـ Provisioning — تبسيط ضخم لأصعب تحدٍ بالمشروع (تكرار النشر). فصل Backend بمشروع منفصل (NestJS مثلاً) يضاعف تعقيد Provisioning بلا مبرر بحجم هذا النظام | NestJS منفصل (احترافي أكثر لكن يضاعف تعقيد النشر لكل نسخة، إفراط هندسي هنا تحديداً بسبب نموذج True White-label) |
| **Authentication** | **NextAuth.js (Auth.js) + JWT** | جاهز، يدعم Credentials Provider (بريد/كلمة مرور)، يتكامل طبيعياً مع Next.js | بناء نظام Auth يدوي بالكامل (وقت إضافي غير مبرر بجدول 3 أشهر) |
| **Validation** | **Zod** (نفس مستخدم بالـ Frontend) | مصدر حقيقة واحد للتحقق، يقلل الأخطاء | Joi (لا مشاركة Schema سهلة مع TypeScript/Frontend) |
| **Background Jobs** | **دوال async بسيطة + Cron مجاني للتذكيرات** (مثال: Vercel Cron أو GitHub Actions Scheduled) | لا حمل يبرر Queue حقيقي (BullMQ/Redis) بهذا الحجم | BullMQ (يتطلب Redis — تعقيد وتكلفة إضافية غير مبررة الآن) |

## Database

| القرار | الخيار | لماذا | البدائل المرفوضة |
|---|---|---|---|
| **Database** | **PostgreSQL** (عبر **Supabase** أو **Neon** — كلاهما Free Tier فعلي) | علاقات علائقية واضحة (طلاب↔فصول↔درجات↔فواتير)، ACID كامل، ونضج عالٍ — الخيار الافتراضي القوي بالدليل الأساسي | MongoDB (لا حاجة مرونة Schema هنا؛ البيانات علائقية بطبيعتها بوضوح) |
| **مزوّد الاستضافة (DB)** | **Supabase Free Tier** لكل نسخة عميل | يوفر أيضاً Auth/Storage جاهزة (احتياطي إن احتجنا لاحقاً)، وواجهة إدارة سهلة تسهّل Provisioning شبه اليدوي بالمرحلة الأولى | Neon (بديل قوي أيضاً — يُحتفظ كخيار ثانٍ إن واجهنا حدود Supabase Free Tier) |
| **ORM** | **Prisma** | نمط Migration واضح وآمن، توليد أنواع TypeScript تلقائياً (يقلل أخطاء)، أداة قياسية بمجتمع Next.js | TypeORM (توثيق أقل نضجاً حالياً مقارنة بـPrisma لمشاريع Next.js) |

## Infrastructure

| القرار | الخيار | لماذا |
|---|---|---|
| **Hosting (Frontend+Backend)** | **Vercel Free Tier** | نشر مباشر من Git لكل نسخة (مهم لـ Provisioning شبه اليدوي)، تكامل طبيعي مع Next.js |
| **Storage (شعارات المدارس)** | **Supabase Storage Free Tier** | مرتبط أصلاً بقاعدة البيانات المختارة، لا حاجة مزوّد إضافي |
| **CI/CD** | **GitHub Actions (مجاني للمستودعات الصغيرة)** | Lint + Type Check + Tests قبل كل نشر |
| **Monitoring** | **UptimeRobot (مجاني) + Vercel Analytics الأساسي** | يكفي لمرحلة MLP الأولى؛ يُرفَّع لاحقاً عند الحاجة الفعلية |
| **Email** | **Resend Free Tier** | تكامل بسيط مع Next.js، حدود يومية مجانية كافية لحجم مدرسة واحدة |

## بوابات الدفع (راجع DECISIONS.md للتفصيل الكامل)
- خليج + العراق: **PayTabs**
- UK/US: **Stripe**
- سوريا: **تسوية يدوية** بالإصدار الأول

---

## ملخص Stack الكامل
```
Frontend + Backend: Next.js (TypeScript) — مشروع واحد
UI: Tailwind CSS + shadcn/ui
i18n: next-intl (عربي/إنجليزي، RTL/LTR)
Auth: NextAuth.js
Validation: Zod (مشترك Frontend/Backend)
ORM: Prisma
Database: PostgreSQL (Supabase Free Tier)
Hosting: Vercel Free Tier
Payments: PayTabs (خليج+عراق) / Stripe (UK/US) / يدوي (سوريا)
Email: Resend Free Tier
Monitoring: UptimeRobot + Vercel Analytics
```

**لماذا هذا الاختيار متماسك مع القرار المعماري (Modular Monolith + True White-label)؟**
مستودع Git واحد (Next.js Full-stack) = وحدة النشر الأبسط الممكنة لتكرارها لكل عميل جديد بـ Provisioning شبه اليدوي. أي تعقيد إضافي (Backend منفصل، Microservices، Queue خارجي) كان سيرفع تعقيد أصعب نقطة بالمشروع فعلياً: **تكرار نشر نسخة كاملة بسرعة لكل مدرسة عميلة جديدة.**
