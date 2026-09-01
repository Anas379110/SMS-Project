# DATABASE.md

قاعدة بيانات واحدة **لكل نسخة عميل** (True White-label — لا Tenant ID بالجداول، العزل فيزيائي). هذا الـ Schema يُنسخ حرفياً بكل Provisioning جديد (عبر Prisma Migrate).

## 1. الكيانات الأساسية (Business Entities)

- User (حساب دخول عام — يُربط بدور واحد)
- Role: Admin / Teacher / Parent / Student / Accountant
- SchoolSettings (شعار، ألوان، اسم المدرسة، الدولة، طريقة الدفع المفعّلة)
- Student
- Guardian (ولي الأمر — قد يرتبط بأكثر من طالب)
- ClassRoom (فصل دراسي)
- Enrollment (ربط طالب↔فصل↔سنة دراسية)
- TeacherAssignment (ربط معلم↔فصل↔مادة)
- Subject (مادة دراسية)
- AttendanceRecord
- Grade
- ScheduleEntry (حصة بجدول)
- FeeStructure (بند رسوم)
- Invoice
- Payment
- Notification

## 2. العلاقات الأساسية (مختصر — التفصيل الكامل بـ ERD.mmd)
- User (1) ── (1) Role
- Guardian (1) ── (N) Student
- ClassRoom (1) ── (N) Enrollment ── (1) Student
- ClassRoom (1) ── (N) TeacherAssignment ── (1) User [دور Teacher]
- Student (1) ── (N) AttendanceRecord
- Student (1) ── (N) Grade
- Student (1) ── (N) Invoice ── (N) Payment
- ClassRoom (1) ── (N) ScheduleEntry

## 3. القيود (Constraints)
- `User.email` — Unique
- `Student.id` + `Guardian.id` — Foreign Keys صارمة، لا حذف Cascade تلقائي لبيانات الطلاب (Soft Delete/أرشفة بدل حذف فعلي — بيانات أكاديمية لا تُفقد)
- `Payment.amount` — Check Constraint > 0
- `AttendanceRecord` — Unique constraint على (studentId, classRoomId, date) لمنع تسجيل مزدوج لنفس اليوم

## 4. Indexes (أساسية للأداء منذ البداية)
- `Student.guardianId`
- `AttendanceRecord.(studentId, date)`
- `Grade.studentId`
- `Invoice.studentId`
- `Invoice.status` (لتسريع تقرير المستحقات)

## 5. Audit Fields (على كل الجداول الرئيسية)
`createdAt`, `updatedAt` — إلزامية بكل الجداول عبر Prisma `@default(now())` / `@updatedAt`.

## 6. استراتيجية Migration
- **Prisma Migrate** لكل تغيير Schema، مُختبر أولاً محلياً قبل أي نسخة عميل حقيقية
- لا تُطبَّق تغييرات Schema خطرة (حذف عمود يحتوي بيانات) مباشرة — استراتيجية **Expand → Migrate → Contract**:
  1. إضافة العمود الجديد بدون حذف القديم
  2. نقل البيانات وتحديث الكود ليستخدم الجديد
  3. حذف العمود القديم بعد التأكد من الاستقرار
- كل نسخة عميل تُحدَّث بتشغيل نفس Migration يدوياً بالمرحلة الأولى (حتى تُبنى أتمتة Fleet Management لاحقاً — راجع ARCHITECTURE.md)

## 7. Seed Data
- بيانات أولية لكل نسخة جديدة: الأدوار الخمسة (كـ Enum لا جدول منفصل)، حساب Admin أول، إعدادات مدرسة افتراضية فارغة
- لا Seed لبيانات طلاب وهمية بالإنتاج — فقط ببيئة التطوير المحلية للاختبار

## 8. اعتبار خاص: بيانات القاصرين
جدول `Student` يحتوي بيانات لقاصرين — يُطبّق:
- لا عرض بيانات طالب لغير (Admin، معلمه المباشر، ولي أمره، الطالب نفسه إن سمحت المرحلة العمرية)
- عدم تخزين بيانات حساسة غير ضرورية (لا حاجة رقم هوية وطني مثلاً بهذا الإصدار ما لم يُطلب صراحة)

---

**الملف المرافق:** `docs/database/ERD.mmd` — مخطط Mermaid للعلاقات الكاملة.
**مجلدات التنفيذ:** `database/migrations/` و`database/seeds/` — تُملأ فعلياً بمرحلة Development (Gate 7)، فارغة حالياً بمرحلة التخطيط.
