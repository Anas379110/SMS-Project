import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * راجع CLAUDE.md القسم 10 (Security Rules): كلمات المرور تُخزَّن مُجزَّأة (bcrypt) فقط،
 * لا نص صريح أبداً تحت أي ظرف.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
