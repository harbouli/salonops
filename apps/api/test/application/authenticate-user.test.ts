import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AuthenticateUserUseCase } from '../../src/application/use-cases/authenticate-user.use-case';
import { IUserRepository } from '../../src/domain/ports/user-repository.port';
import { IPasswordHasherPort } from '../../src/domain/ports/password-hasher.port';
import { ITokenServicePort, AuthTokenPayload } from '../../src/domain/ports/token-service.port';
import { User } from '../../src/domain/models/user.entity';
import { InvalidCredentialsException } from '../../src/domain/exceptions/domain.exception';
import { UserRole } from '@salonops/shared-types';

describe('AuthenticateUserUseCase (Hexagonal Outbound Ports)', () => {
  const dummyUser = new User({
    id: 'user-uuid-100',
    branchId: 'branch-uuid-1',
    fullName: 'Anas Dalfag',
    phone: '0661234567',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mockHashValue',
    role: UserRole.OWNER,
    commissionPct: 20,
    isActive: true,
  });

  const inactiveUser = new User({
    ...dummyUser,
    id: 'user-uuid-101',
    phone: '0669998877',
    isActive: false,
  });

  function createMockAuthPorts(users: User[] = [dummyUser, inactiveUser]) {
    const userRepo: IUserRepository = {
      findByPhone: async (phone: string) => users.find((u) => u.phone === phone) || null,
      findById: async (id: string) => users.find((u) => u.id === id) || null,
      save: async (u: User) => u,
    };

    const passwordHasher: IPasswordHasherPort = {
      hash: async (password: string) => `hashed_${password}`,
      verify: async (password: string, hash: string) => {
        return password === 'correctPassword123' && hash === dummyUser.passwordHash;
      },
    };

    let signedPayload: AuthTokenPayload | null = null;
    const tokenService: ITokenServicePort = {
      sign: async (payload: AuthTokenPayload) => {
        signedPayload = payload;
        return 'mocked-jwt-token-xyz';
      },
      verify: async (token: string) => {
        if (token === 'mocked-jwt-token-xyz') {
          return signedPayload!;
        }
        throw new Error('Token invalide');
      },
    };

    return {
      userRepo,
      passwordHasher,
      tokenService,
      getSignedPayload: () => signedPayload,
    };
  }

  it('should successfully authenticate user with valid credentials and return JWT token', async () => {
    const ports = createMockAuthPorts();
    const useCase = new AuthenticateUserUseCase(
      ports.userRepo,
      ports.passwordHasher,
      ports.tokenService
    );

    const result = await useCase.execute({
      phone: '+212661234567', // International format should normalize to 0661234567
      password: 'correctPassword123',
    });

    assert.equal(result.token, 'mocked-jwt-token-xyz');
    assert.equal(result.user.id, dummyUser.id);
    assert.equal(result.user.fullName, 'Anas Dalfag');
    assert.equal(result.user.role, UserRole.OWNER);
    assert.equal(result.user.branchId, 'branch-uuid-1');

    const payload = ports.getSignedPayload();
    assert.ok(payload);
    assert.equal(payload.userId, dummyUser.id);
    assert.equal(payload.role, UserRole.OWNER);
  });

  it('should throw InvalidCredentialsException when user phone is not registered', async () => {
    const ports = createMockAuthPorts();
    const useCase = new AuthenticateUserUseCase(
      ports.userRepo,
      ports.passwordHasher,
      ports.tokenService
    );

    await assert.rejects(
      async () => {
        await useCase.execute({
          phone: '0600000000',
          password: 'correctPassword123',
        });
      },
      InvalidCredentialsException
    );
  });

  it('should throw InvalidCredentialsException when password does not match', async () => {
    const ports = createMockAuthPorts();
    const useCase = new AuthenticateUserUseCase(
      ports.userRepo,
      ports.passwordHasher,
      ports.tokenService
    );

    await assert.rejects(
      async () => {
        await useCase.execute({
          phone: '0661234567',
          password: 'wrongPassword!',
        });
      },
      InvalidCredentialsException
    );
  });

  it('should throw InvalidCredentialsException when user account is inactive', async () => {
    const ports = createMockAuthPorts();
    const useCase = new AuthenticateUserUseCase(
      ports.userRepo,
      ports.passwordHasher,
      ports.tokenService
    );

    await assert.rejects(
      async () => {
        await useCase.execute({
          phone: '0669998877',
          password: 'correctPassword123',
        });
      },
      InvalidCredentialsException
    );
  });
});
