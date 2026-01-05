/**
 * Utility functions for invite module
 */

/**
 * Generate a random 6-digit numeric code
 * @returns {string} 6-digit code
 */
export const generateInviteCode = (): string => {
    return Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0');
};

/**
 * Validate invite code format (6 digits)
 * @param code - Code to validate
 * @returns {boolean} true if valid
 */
export const isValidInviteCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
};

/**
 * Generate invite link
 * @param inviteId - Invite ID
 * @param baseUrl - Base URL (e.g., from config)
 * @returns {string} Invite link
 */
export const generateInviteLink = (
    inviteId: string,
    baseUrl: string = 'https://app.e-citizen.ph'
): string => {
    return `${baseUrl}/invite/accept?id=${inviteId}`;
};

/**
 * Check if invite has expired
 * @param expiresAt - Expiration time
 * @returns {boolean} true if expired
 */
export const isInviteExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};

/**
 * Calculate expiration time (15 minutes from now)
 * @returns {Date} Expiration timestamp
 */
export const calculateExpiration = (): Date => {
    return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
};
