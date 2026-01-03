export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
};

export default authConfig;
