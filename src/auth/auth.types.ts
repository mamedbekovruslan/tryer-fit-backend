import type { Request } from 'express';

export type UserType = 'client' | 'trainer';

export interface JwtPayload {
  email: string;
  sub: number;
  user_type: UserType;
}

export interface AuthUser {
  sub: number;
  userId: number;
  user_type: UserType;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
