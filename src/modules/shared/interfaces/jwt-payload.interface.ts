import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}
