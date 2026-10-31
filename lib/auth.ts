import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_2026_subscription_system';
const COOKIE_NAME = 'brightloop_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password rule: >8 chars, with an uppercase letter, a lowercase letter and a special character
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length <= 8) {
    return { valid: false, message: 'Password must be more than 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character.' };
  }
  return { valid: true };
}

export async function getSessionUser(req?: Request): Promise<TokenPayload | null> {
  // Try Authorization header first
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) return payload;
    }
  }

  // Fallback to cookies
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      return verifyToken(token);
    }
  } catch {
    // cookies() might fail if outside Next request context
  }

  return null;
}

export { COOKIE_NAME };

