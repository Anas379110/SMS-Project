# TASKS.md

## EPIC 1: Auth + Branding (Increment 1) — ✅ مكتمل
- [x] تهيئة مشروع Next.js (TypeScript, Tailwind, next-intl)
- [x] Prisma Schema كامل (كل الكيانات من DATABASE.md، حتى المستخدمة بـ Increments لاحقة — لثبات العلاقات)
- [x] Auth Module: Schema (Zod)، تجزئة كلمات المرور، RBAC helpers
- [x] NextAuth (Credentials Provider + JWT + Session بحقل role)
- [x] Branding Module: قراءة SchoolSettings وعرضها بصفحة الدخول ديناميكياً
- [x] صفحة تسجيل دخول (RTL/LTR، بلا نص Hardcoded)
- [x] صفحة رئيسية محمية (تحقق جلسة + توجيه)
- [x] Seed Script (Admin أولي + إعدادات مدرسة افتراضية)
- [x] اختبارات وحدة: password, schema, rbac (الحالة الأمنية الحرجة: ولي الأمر لا يصل لبيانات طالب ليس ابنه)
- [ ] **Security Review فعلي (security-reviewer Agent)** — يُنفَّذ بجلسة عمل قادمة قبل اعتبار Increment 1 مغلقاً نهائياً
- [ ] تشغيل فعلي (`npm install` + `npm run test`) للتأكد من عدم وجود أخطاء تجميع — لم يُنفَّذ بهذه الجلسة (لا اتصال شبكة بالبيئة الحالية)

## EPIC 2: Academic — Students & Classes (Increment 2) — ✅ مكتمل كوداً
- [x] Prisma: إضافة نموذج TeacherAssignment المفقود من Schema الأصلي (اكتُشف أثناء التنفيذ — راجع DECISIONS.md)
- [x] Service Layer: listStudents, listStudentsForGuardian, getStudentById, isTeacherAssignedToStudent, createStudent, updateStudent, archiveStudent, listClassRooms, createClassRoom
- [x] API: `/api/v1/students` (GET/POST)، `/api/v1/students/:id` (GET/PATCH/DELETE)، `/api/v1/classrooms` (GET/POST) — RBAC فعلي بكل Endpoint
- [x] UI: قائمة الطلاب (تختلف تلقائياً لولي الأمر)، تفاصيل طالب (مع رسالة Forbidden بشرية)، إضافة طالب، قائمة/إضافة فصول
- [x] Empty States وForbidden States فعلية بالواجهة (لا شاشات فارغة صامتة)
- [x] اختبارات وحدة إضافية: academic-schema.test.ts
- [ ] Security Review فعلي لـ Endpoint تفاصيل الطالب (أهم نقطة أمنية بالوحدة) — لم يُنفَّذ بعد
- [ ] تشغيل فعلي (npm install/test) — لم يُنفَّذ (بلا شبكة بهذه البيئة، كما بـ Increment 1)

## EPIC 3: Attendance (Increment 3) — ✅ مكتمل كوداً
- [x] Prisma: إضافة `Student.userId` (اختياري) لدعم دخول الطالب المباشر — اكتُشفت الحاجة أثناء التنفيذ (راجع DECISIONS.md)
- [x] `canAccessStudent`: تفعيل حالة STUDENT فعلياً بدل رفضها دائماً
- [x] Service Layer: markAttendance (Batch Upsert + إشعار أولياء أمور الغائبين تلقائياً)، getAttendanceSheet، getAttendanceForStudent
- [x] API: `POST /api/v1/attendance` (Teacher، بتحقق أنه مسؤول فعلياً عن الفصل)، `GET /api/v1/attendance/student/:studentId`
- [x] UI: اختيار الفصل (فصول هذا المعلم فقط) → شاشة تسجيل حضور سريعة (حاضر افتراضياً، تعديل بنقرة واحدة) → قسم سجل حضور مضاف لصفحة تفاصيل الطالب
- [x] اختبارات وحدة: attendance-schema.test.ts + تحديث auth-rbac.test.ts (حالة STUDENT)
- [ ] Security Review فعلي — لا يزال مؤجلاً (3 Increments متتالية الآن بلا مراجعة فعلية ولا تشغيل حقيقي — راجع STATUS.md)
## EPIC 4: Grades (Increment 4) — ✅ مكتمل كوداً
- [x] Service Layer: createGrade, getGradesForStudent, listSubjects/createSubject، isTeacherAssignedToStudentSubject (تحقق أدق من تحقق الحضور — يشمل المادة لا الفصل فقط)
- [x] API: `POST /api/v1/grades`، `GET /api/v1/grades/student/:studentId` (نفس RBAC الموحّد)
- [x] UI: اختيار فصل+مادة → نموذج رصد درجة → كشف درجات مضاف لصفحة تفاصيل الطالب
- [x] اختبارات وحدة: grades-schema.test.ts
- [ ] Security Review فعلي — **مؤجل الآن لـ4 Increments متتالية**
## EPIC 5: Schedule (Increment 5) — ✅ مكتمل كوداً
- [x] Prisma: إضافة نموذج `ScheduleEntry` المفقود (**الاكتشاف الهندسي الثالث من نفس النمط — راجع DECISIONS.md بتحليل السبب الجذري**)
- [x] Service Layer: createScheduleEntry، getScheduleForClassRoom (مفروزة زمنياً)، isUserRelatedToClassRoom
- [x] API: `POST /api/v1/schedule` (Admin)، `GET /api/v1/schedule/classroom/:classRoomId` (كل الأدوار المرتبطة فعلياً بالفصل، بتحقق حقيقي لا افتراض)
- [x] UI: جدول أسبوعي بسيط، نموذج إضافة حصة (Admin)
- [x] اختبارات وحدة: schedule-schema.test.ts
- [ ] Security Review فعلي — **مؤجل الآن لـ5 Increments متتالية**
## Security Review Round 1 (2026-08-19) — ✅ مكتمل عبر كل الوحدات السبع
- [x] **مُصحح:** ثغرة حقن حضور دفعي (Attendance)
- [x] **مُصحح:** فجوة تعطّل دور Teacher بالكامل (Academic — Subject/TeacherAssignment)
- [x] **مُصحح:** فجوة تسجيل الطلاب بالفصول (Academic)
- [x] Financial — راجعت بعمق، لا اكتشافات
- [x] Grades — راجعت، لا اكتشافات إضافية
- [x] **مُصحح: Auth — ثغرة Brute Force** (قفل حساب بعد 5 محاولات فاشلة، 15 دقيقة، مبني على Postgres)
- [x] Auth — تقليص مدة الجلسة لـ8 ساعات (تخفيف جزئي لخطر جلسة مستخدم مُوقف)
- [x] فحص منهجي شامل: كل دالة Service بكل الوحدات مُستخدمة فعلياً — لا فجوات إضافية
- [ ] لم تُراجَع بعد: Webhooks (منفصل أصلاً كـNEEDS TESTING، يحتاج بيئة Sandbox حقيقية لا مراجعة كود)
- [ ] لم يحدث بعد: تشغيل فعلي — **هذا الآن الفجوة الوحيدة المتبقية بمنهجية المراجعة كلها**

## EPIC 6: Financial (Increment 6) — ✅ مكتمل كوداً (الأعقد: PayTabs/Stripe/يدوي حسب الدولة)
- [x] تحقق مسبق من Schema مقابل DATABASE.md قبل الكتابة (درس مستفاد من 3 اكتشافات سابقة) — FeeStructure/Invoice/Payment كانت موجودة فعلاً، لا فجوة رابعة
- [x] `payment-routing.ts`: نقطة حقيقة واحدة لتوجيه الدولة↔البوابة (PayTabs: خليج+عراق، Stripe: UK/US، يدوي: سوريا) + اختبار وحدة مخصص يحمي هذا القرار البحثي تحديداً
- [x] Service Layer: fee structures, invoices, تسجيل دفعة (يدوي وبوابات)، تحديث حالة الفاتورة تلقائياً (Transaction آمنة)، تقرير مالي مبسّط
- [x] API: fee-structures, invoices, invoices/student/:id (Teacher مستثنى صراحة)، payments (يدوي)، **webhooks PayTabs/Stripe (⚠️ NEEDS TESTING صريح — راجع DECISIONS.md، ليست جاهزة بثقة كباقي الكود)**، reports/financial-summary
- [x] UI: بنود رسوم، إصدار فاتورة، تسجيل دفعة يدوية بصفحة الطالب، تقرير مالي
- [x] اختبارات وحدة: financial-schema.test.ts + financial-payment-routing.test.ts (الأهم — يحمي قرار الدول الثمانية)
- [ ] Security Review فعلي — **مؤجل الآن لـ6 Increments متتالية (كل الوحدات Must مكتملة كوداً)**
- [ ] **NEEDS TESTING إلزامي قبل الإنتاج:** تحقق توقيع Webhooks مقابل Sandbox حقيقي لكل بوابة، تثبيت مكتبة `stripe` الرسمية

راجع `docs/project/SDLC.md` لترتيب الأولوية الكامل و`SCOPE.md` لتفاصيل كل وحدة.

## Password Reset (2026-08-30) — ✅ مكتمل كوداً (كانت فجوة موثّقة منذ Gate 5)
- [x] Schema: `resetTokenHash`/`resetTokenExpiresAt` على User
- [x] منطق توليد/تجزئة/صلاحية الرمز (`passwordReset.ts`) + اختبارات وحدة كاملة
- [x] API: `POST /api/v1/auth/reset-password/request` (رسالة موحّدة، لا User Enumeration) و`/confirm`
- [x] UI: `/forgot-password`، `/reset-password`، ربط الرابط بصفحة الدخول
- [ ] NEEDS TESTING: تسليم البريد الفعلي عبر Resend (best-effort حالياً، بديل Console بالتطوير المحلي)

## Static Analysis (2026-08-30) — ✅ نظيف
- [x] كل استيرادات `@/*` صحيحة
- [x] كل نماذج/حقول Prisma المستخدمة بالكود مطابقة لـschema.prisma
- [x] أسماء المفاتيح المركّبة (`studentId_classRoomId_date`) مطابقة لترتيب `@@unique`
- [x] قيم `enum PaymentMethod` مطابقة بين Schema والكود

## Invoice State Machine Fix (2026-08-30) — ✅ مكتمل
- [x] اكتشاف: `OVERDUE` معرّفة ومُستخدمة بالتقرير المالي، لا مسار كتابة يُفعّلها أبداً (بيانات مضلِّلة صامتة، لا Exception)
- [x] إصلاح: `computeEffectiveStatus` — حساب ديناميكي عند القراءة، مطبّق على `getInvoicesForStudent` و`getFinancialSummary`
- [x] فحص وقائي شامل لكل قيم enum بكل النماذج — قيمة واحدة إضافية غير مُستخدمة (`CANCELLED`) ومُيِّزت بوضوح كفجوة Should غير حرجة، لا خطأ
- [x] اختبار وحدة: `tests/financial-overdue-status.test.ts` (5 حالات)

## Notifications + Dashboard Navigation (2026-08-30) — ✅ مكتمل
- [x] اكتشاف: FR-8.1 مكتمل 1/3 فقط (غياب فقط) — أُضيف إشعار createGrade وcreateInvoice
- [x] اكتشاف أخطر: لا واجهة إطلاقاً لعرض الإشعارات (حتى الموجود منها كان غير مرئي)
- [x] وحدة Notifications كاملة: service.ts، GET /api/v1/notifications، PATCH .../:id/read، صفحة UI تفاعلية
- [x] اكتشاف: اللوحة الرئيسية بقيت بنسخة Increment 1 الأولية بلا تنقّل لـ6 Increments لاحقة — أُعيد بناؤها بروابط حسب الدور + مؤشر إشعارات غير مقروءة
- [x] فحص تحقق نهائي: استيرادات + مساحات أسماء next-intl — نظيف (مع تصحيح فوري لخطأ قوس JSON اكتُشف بنفس الأداة)
