import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import { getSchoolSettings } from "@/modules/branding/getSchoolSettings";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "School Management System",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const messages = await getMessages();
  const settings = await getSchoolSettings();

  // راجع docs/design/UI-UX.md القسم 10: الاتجاه يتغير فعلياً حسب اللغة، لا CSS ثابت
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={dir === "rtl" ? "font-arabic" : "font-latin"}
        style={
          {
            "--brand-color": settings.primaryColor,
          } as React.CSSProperties
        }
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
