import { PrismaClient } from "@prisma/client";

// نمط قياسي لتفادي فتح اتصالات متعددة أثناء Hot Reload بالتطوير
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
