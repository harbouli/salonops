import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AuthTokenPayload, ITokenServicePort } from '../../domain/ports/token-service.port';
import { UnauthorizedAccessException } from '../../domain/exceptions/domain.exception';

export class JwtTokenAdapter implements ITokenServicePort {
  private readonly secret: Secret;
  private readonly defaultExpiresIn: string;

  constructor(
    secret: string = process.env.JWT_SECRET || 'salonops-super-secret-key-change-in-prod',
    defaultExpiresIn: string = process.env.JWT_EXPIRES_IN || '1d'
  ) {
    this.secret = secret;
    this.defaultExpiresIn = defaultExpiresIn;
  }

  public async sign(payload: AuthTokenPayload, expiresIn?: string): Promise<string> {
    const options: SignOptions = {
      expiresIn: (expiresIn || this.defaultExpiresIn) as SignOptions['expiresIn'],
    };

    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, this.secret, options, (err, token) => {
        if (err || !token) {
          return reject(err || new Error('Erreur lors de la génération du token JWT'));
        }
        resolve(token);
      });
    });
  }

  public async verify(token: string): Promise<AuthTokenPayload> {
    return new Promise<AuthTokenPayload>((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err || !decoded) {
          return reject(new UnauthorizedAccessException('Token invalide ou expiré.'));
        }
        resolve(decoded as AuthTokenPayload);
      });
    });
  }
}
