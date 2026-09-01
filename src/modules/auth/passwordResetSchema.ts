import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const confirmPasswordResetSchema = z.object({
  token: z.string().min(32),
  newPassword: z.string().min(8),
});
export type ConfirmPasswordResetInput = z.infer<typeof confirmPasswordResetSchema>;
