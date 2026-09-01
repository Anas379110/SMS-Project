#!/bin/bash
# .claude/hooks/pre-commit-secrets-check.sh
# يُنفَّذ تلقائياً قبل أي عملية git commit (PreToolUse hook)
# يمنع الـ Commit إذا وُجد ملف حساس أو مفتاح API صريح بالتغييرات

set -e

# 1. منع ملفات حساسة معروفة
if git diff --cached --name-only | grep -qE '\.env$|\.env\.local$|\.pem$|\.key$|settings\.local\.json$'; then
  echo "❌ رُفض الـ Commit: ملف حساس ضمن التغييرات (.env / .pem / .key / settings.local.json)"
  exit 1
fi

# 2. منع مفاتيح API صريحة بالمحتوى (نمط عام: مفتاح طويل بعد كلمة key/secret/token)
if git diff --cached | grep -qiE '(api[_-]?key|secret|token)\s*[:=]\s*["\047][A-Za-z0-9_\-]{20,}'; then
  echo "❌ رُفض الـ Commit: يبدو أن هناك مفتاح API أو Secret صريح بالكود"
  exit 1
fi

# 3. منع بيانات اتصال قاعدة بيانات صريحة (DATABASE_URL بقيمة فعلية لا placeholder)
if git diff --cached | grep -qE 'DATABASE_URL\s*=\s*["\047]?postgres(ql)?://[^$]'; then
  echo "❌ رُفض الـ Commit: رابط اتصال قاعدة بيانات فعلي موجود بالتغييرات — استخدم .env فقط"
  exit 1
fi

echo "✅ فحص الأسرار الأمني ناجح — لا مشاكل مكتشفة"
exit 0
