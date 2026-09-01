import type { DefaultSession } from "next-auth";

// راجع CLAUDE.md — لا any: نوسّع أنواع next-auth رسمياً بدل استخدام any بالكود
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
