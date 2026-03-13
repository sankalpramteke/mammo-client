// lib/verifyToken.ts — shared JWT verification helper for API routes
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  doctorId: string;
  email: string;
  name: string;
}

/**
 * Verifies the Bearer token from request Authorization header.
 * Returns the decoded payload or null if invalid/missing.
 */
export function verifyToken(authHeader: string | null): JwtPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
