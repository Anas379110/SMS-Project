import { z } from "zod";

// راجع CLAUDE.md القسم 6/8: كل Input يمر عبر Zod قبل أي منطق عمل
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;
