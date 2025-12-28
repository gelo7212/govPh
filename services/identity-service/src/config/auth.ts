/**
 * Auth Configuration
 * JWT secret keys, expiration times, and security settings
 */

export const authConfig = {
  // JWT Configuration
  jwt: {
    issuer: 'identity.e-citizen',
    audience: 'e-citizen',
    
    // Access token validity: 1 hour
    accessTokenExpiry: 60 * 60, // seconds :: 1 hour
    
    // Refresh token validity: 7 days
    refreshTokenExpiry: 7 * 24 * 60 * 60, // seconds :: 7 days
  },

  // Get JWT private key for signing (RS256)
  getAccessTokenSecret: (): string => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return secret;
  },

  // Get JWT public key for verification (RS256)
  getAccessTokenPublicKey: (): string => {
    const publicKey = process.env.JWT_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('JWT_PUBLIC_KEY environment variable is not set');
    }
    return publicKey;
  },

  // Get JWT refresh token private key for signing (RS256)
  getRefreshTokenSecret: (): string => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return secret;
  },

  // Get JWT refresh token public key for verification (RS256)
  getRefreshTokenPublicKey: (): string => {
    const publicKey = process.env.JWT_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('JWT_PUBLIC_KEY environment variable is not set');
    }
    return publicKey;
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
