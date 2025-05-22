import type { APIContext } from 'astro';
import { verifyToken } from './auth';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
  };
}

export async function authenticateUser(context: APIContext): Promise<{ userId?: number; roleId?: number; isAuthenticated: boolean }> {
  const authHeader = context.request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false };
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { isAuthenticated: false };
  }
  
  return { userId: decoded.userId, roleId: decoded.roleId, isAuthenticated: true };
}

export function isAdmin(roleId: number): boolean {
  // Assuming role ID 1 is for admin users
  return roleId === 1;
}

export function isSameUserOrAdmin(userId: number, targetUserId: number, roleId: number): boolean {
  return userId === targetUserId || isAdmin(roleId);
}
