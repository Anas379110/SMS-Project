import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n";

// راجع CLAUDE.md القسم 8: لا نص Hardcoded — كل مسار يمر عبر بادئة اللغة
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // استثناء ملفات API الداخلية وملفات Next الثابتة من إعادة التوجيه اللغوي
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
