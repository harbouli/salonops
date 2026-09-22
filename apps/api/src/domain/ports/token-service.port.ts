import { UserRole } from '@salonops/shared-types';

export interface AuthTokenPayload {
  userId: string;
  phone: string;
  role: UserRole;
  branchId: string;
}

export interface ITokenServicePort {
  sign(payload: AuthTokenPayload, expiresIn?: string): Promise<string>;
  verify(token: string): Promise<AuthTokenPayload>;
}
