import { UserRole } from '@salonops/shared-types';

export interface LoginDTO {
  phone: string;
  password: string;
}

export interface AuthUserDTO {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  branchId: string;
  avatarUrl?: string | null;
}

export interface AuthTokenResultDTO {
  token: string;
  user: AuthUserDTO;
}

export interface IAuthenticateUserUseCase {
  execute(dto: LoginDTO): Promise<AuthTokenResultDTO>;
}
