import {
  AuthTokenResultDTO,
  IAuthenticateUserUseCase,
  LoginDTO,
} from '../ports/auth.port';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { IPasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { ITokenServicePort } from '../../domain/ports/token-service.port';
import { MoroccanPhoneNumber } from '../../domain/value-objects/phone-number.vo';
import { InvalidCredentialsException } from '../../domain/exceptions/domain.exception';

export class AuthenticateUserUseCase implements IAuthenticateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasherPort,
    private readonly tokenService: ITokenServicePort
  ) {}

  public async execute(dto: LoginDTO): Promise<AuthTokenResultDTO> {
    let normalizedPhone = dto.phone;
    try {
      normalizedPhone = MoroccanPhoneNumber.create(dto.phone).value;
    } catch {
      // Keep raw phone if normalization fails
    }

    const user = await this.userRepo.findByPhone(normalizedPhone);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      throw new InvalidCredentialsException('Ce compte utilisateur est désactivé.');
    }

    const isPasswordValid = await user.verifyPassword(this.passwordHasher, dto.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const token = await this.tokenService.sign({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
