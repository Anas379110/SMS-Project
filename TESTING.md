# TESTING.md

راجع `docs/requirements/SRS.md` (Non-Functional Requirements) و`CLAUDE.md` القسم 9 قبل أي تعديل.

## الأنواع المستخدمة بهذا المشروع
- **Unit Tests (Vitest):** لكل منطق أعمال حساس — إلزامي لـ Auth، RBAC، Financial لاحقاً
- **Integration Tests:** تُضاف تدريجياً بدءاً من Increment الطلاب/الفصول (اختبار Endpoint كامل مع قاعدة بيانات اختبار)
- **E2E:** تُضاف لاحقاً عند استقرار الشاشات الأساسية (بعد Increment 2-3) — أداة مقترحة: Playwright

## قاعدة التغطية
لا هدف تغطية رقمي صارم بهذه المرحلة (MLP بفريق صغير) — لكن **كل منطق يلمس الأمان أو المال أو بيانات القاصرين يجب أن يملك اختبار وحدة على الأقل قبل اعتباره Done** (راجع Definition of Done بـ CLAUDE.md).

## حالات الاختبار الإلزامية لكل Feature جديدة
- Happy Path
- Invalid Input (يرفضه Zod)
- Unauthorized (لا جلسة)
- Forbidden (جلسة صحيحة لكن دور غير مصرح — مثال: ولي أمر يحاول الوصول لبيانات طالب ليس ابنه)
- Boundary Cases ذات الصلة بالـ Feature

## Increment 1 (Auth + Branding) — الاختبارات الحالية
- `tests/auth-password.test.ts` — تجزئة والتحقق من كلمات المرور
- `tests/auth-schema.test.ts` — تحقق Zod لبيانات تسجيل الدخول
- `tests/auth-rbac.test.ts` — أهم حالة أمنية بالمشروع: منع ولي الأمر من الوصول لبيانات طالب ليس ابنه

## تشغيل الاختبارات
```bash
npm run test
```

## الخطوة القادمة
عند بدء Increment الطلاب/الفصول: إضافة Integration Tests فعلية على Endpoints عبر قاعدة بيانات اختبار منفصلة (لا تُستخدم قاعدة التطوير المحلية لتشغيل الاختبارات تلقائياً).
