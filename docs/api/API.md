# API.md

REST API، JSON، إصدار v1 عبر Prefix `/api/v1/`. مصادقة عبر JWT (NextAuth session token) بكل طلب محمي.

## قواعد عامة
- كل Endpoint يتحقق من الدور (RBAC) قبل التنفيذ — لا استثناءات
- كل Input يمر عبر Zod Schema قبل الوصول لمنطق العمل
- أخطاء موحّدة: `{ "error": { "code": "...", "message": "..." } }`
- Pagination: `?page=1&limit=20` لكل قوائم طويلة (طلاب، فواتير، إلخ)
- لا معلومات حساسة بأخطاء 401/403 (لا كشف إن كان البريد أم كلمة المرور هي الخاطئة)

## Endpoints الأساسية (MLP — Must فقط)

### Auth
| Method | Path | الوصف | الدور |
|---|---|---|---|
| POST | `/api/v1/auth/login` | تسجيل دخول | عام |
| POST | `/api/v1/auth/logout` | تسجيل خروج | مسجّل دخول |
| POST | `/api/v1/auth/reset-password` | طلب إعادة تعيين كلمة مرور | عام |

### School Settings (Branding)
| Method | Path | الوصف | الدور |
|---|---|---|---|
| GET | `/api/v1/school-settings` | جلب إعدادات المدرسة (شعار/ألوان) | عام (Public — تُعرض بصفحة الدخول) |
| PATCH | `/api/v1/school-settings` | تعديل الإعدادات | Admin |

### Students & Classes
| Method | Path | الوصف | الدور |
|---|---|---|---|
| GET | `/api/v1/students` | قائمة الطلاب (Pagination + فلترة بالفصل) | Admin, Teacher |
| POST | `/api/v1/students` | إضافة طالب | Admin |
| GET | `/api/v1/students/:id` | تفاصيل طالب | Admin, Teacher, Parent (لأبنائه فقط), Student (نفسه فقط) |
| PATCH | `/api/v1/students/:id` | تعديل بيانات طالب | Admin |
| DELETE | `/api/v1/students/:id` | أرشفة طالب (Soft Delete) | Admin |
| GET | `/api/v1/classrooms` | قائمة الفصول | Admin, Teacher |
| POST | `/api/v1/classrooms` | إنشاء فصل | Admin |

### Attendance
| Method | Path | الوصف | الدور |
|---|---|---|---|
| POST | `/api/v1/attendance` | تسجيل حضور فصل ليوم محدد (Batch) | Teacher |
| GET | `/api/v1/attendance/student/:studentId` | سجل حضور طالب تراكمي | Admin, Parent (لأبنائه), Student (نفسه), Teacher |

### Grades
| Method | Path | الوصف | الدور |
|---|---|---|---|
| POST | `/api/v1/grades` | رصد درجة | Teacher |
| GET | `/api/v1/grades/student/:studentId` | كشف درجات طالب | Admin, Parent (لأبنائه), Student (نفسه) |

### Schedule
| Method | Path | الوصف | الدور |
|---|---|---|---|
| GET | `/api/v1/schedule/classroom/:classRoomId` | جدول فصل | كل الأدوار المرتبطة بالفصل |
| POST | `/api/v1/schedule` | إضافة حصة بالجدول | Admin |

### Financial
| Method | Path | الوصف | الدور |
|---|---|---|---|
| POST | `/api/v1/fee-structures` | تعريف بند رسوم | Admin, Accountant |
| POST | `/api/v1/invoices` | إصدار فاتورة | Admin, Accountant |
| GET | `/api/v1/invoices/student/:studentId` | فواتير طالب | Admin, Accountant, Parent (لأبنائه) |
| POST | `/api/v1/payments` | تسجيل دفعة (تلقائي عبر Webhook بوابة، أو يدوي) | Admin, Accountant (يدوي) / Webhook (تلقائي) |
| POST | `/api/v1/payments/webhook/paytabs` | استقبال تأكيد دفع من PayTabs | Webhook (توقيع مُتحقق منه) |
| POST | `/api/v1/payments/webhook/stripe` | استقبال تأكيد دفع من Stripe | Webhook (توقيع مُتحقق منه) |
| GET | `/api/v1/reports/financial-summary` | تقرير مالي مبسّط | Admin, Accountant |

## Error Codes الأساسية
| Code | الحالة |
|---|---|
| `UNAUTHORIZED` | 401 — لا جلسة صالحة |
| `FORBIDDEN` | 403 — دور غير مصرح لهذا الإجراء |
| `NOT_FOUND` | 404 |
| `VALIDATION_ERROR` | 400 — فشل تحقق Zod |
| `CONFLICT` | 409 — مثال: تسجيل حضور مزدوج لنفس اليوم |

## Rate Limiting
حد أساسي بسيط (مثال: 100 طلب/دقيقة لكل مستخدم) عبر Middleware — يكفي لحجم مدرسة واحدة، يُشدَّد لاحقاً إن ظهرت حاجة.

## التوثيق التفاعلي
`docs/api/openapi.yaml` يُبنى تدريجياً أثناء Development (Gate 7) — كل Endpoint يُوثَّق فور تنفيذه فعلياً، لا دفعة واحدة نظرياً الآن لتفادي توثيق يفقد التزامنه مع الكود الفعلي.
