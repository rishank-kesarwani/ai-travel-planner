import { UserRole } from '../enums/roles.enum';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}
