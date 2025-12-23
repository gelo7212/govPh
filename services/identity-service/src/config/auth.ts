/**
 * Auth Configuration
 * JWT secret keys, expiration times, and security settings
 */

export const authConfig = {
  // JWT Configuration
  jwt: {
    issuer: 'identity.e-citizen',
    audience: 'e-citizen',
    
    // Access token validity: 15 minutes
    accessTokenExpiry: 15 * 60, // seconds
    
    // Refresh token validity: 7 days
    refreshTokenExpiry: 7 * 24 * 60 * 60, // seconds
  },

  // Get JWT secret from environment
  getAccessTokenSecret: (): string => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return secret;
  },

  getRefreshTokenSecret: (): string => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return secret;
  },

  // Token revocation
  revocation: {
    // Enable token revocation check
    enabled: process.env.TOKEN_REVOCATION_ENABLED !== 'false',
    
    // Cache revoked tokens for this duration (in seconds)
    // Default: 1 hour
    cacheTtl: parseInt(process.env.TOKEN_REVOCATION_CACHE_TTL || '3600', 10),
  },
};
