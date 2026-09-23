export interface ITokenBlacklistPort {
  /**
   * Adds a token to the blacklist.
   * @param token The raw JWT token to revoke
   * @param ttlSeconds The remaining time-to-live of the token in seconds
   */
  revokeToken(token: string, ttlSeconds: number): Promise<void>;

  /**
   * Checks if a token is blacklisted.
   * @param token The raw JWT token to check
   * @returns true if revoked, false otherwise
   */
  isRevoked(token: string): Promise<boolean>;
}
