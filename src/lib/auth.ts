import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key-change-in-production";

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare a password with a hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a JWT token for a user
export function generateToken(userId: number, roleId: number): string {
  return jwt.sign(
    {
      userId,
      roleId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Verify a JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; roleId: number };
  } catch (error) {
    return null;
  }
}
