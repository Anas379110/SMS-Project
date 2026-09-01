"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const t = useTranslations("dashboard");

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-neutral-500 hover:text-brand"
    >
      {t("signOut")}
    </button>
  );
}
