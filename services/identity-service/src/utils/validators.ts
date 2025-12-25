import { ValidationError, MissingMunicipalityCodeError } from '../errors';
import { UserRole } from '../types';

/**
 * Validate Email Format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Philippine Mobile Number
 * Accepts formats: +63XXXXXXXXXX, 0XXXXXXXXXX
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+63|0)9\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate Municipality Code
 * Format: Uppercase, alphanumeric, max 20 chars
 */
export function validateMunicipalityCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const codeRegex = /^[A-Z0-9]{2,20}$/;
  return codeRegex.test(code);
}

/**
 * Validate Firebase UID Format
 * Firebase UIDs are alphanumeric, 28 chars
 */
export function validateFirebaseUid(uid: string): boolean {
  if (!uid || typeof uid !== 'string') return false;
  return uid.length === 28 && /^[a-zA-Z0-9]*$/.test(uid);
}

/**
 * Ensure Municipality Code is provided for admin roles
 * CRITICAL: city_admin and sos_admin MUST have a scoped municipality
 */
export function validateMunicipalityForRole(
  role: UserRole,
  municipalityCode?: string
): void {
  if ((role === 'CITY_ADMIN' || role === 'SOS_ADMIN') && !municipalityCode) {
    throw new MissingMunicipalityCodeError(role);
  }

  if (municipalityCode && !validateMunicipalityCode(municipalityCode)) {
    throw new ValidationError(
      'Invalid municipality code format',
      'municipalityCode'
    );
  }
}

/**
 * Validate User Creation Payload
 */
export function validateUserCreationPayload(payload: {
  email?: string;
  phone?: string;
  displayName?: string;
  municipalityCode?: string;
}): void {
  if (payload.email && !validateEmail(payload.email)) {
    throw new ValidationError('Invalid email format', 'email');
  }

  if (payload.phone && !validatePhoneNumber(payload.phone)) {
    throw new ValidationError('Invalid phone number format', 'phone');
  }

  if (
    payload.displayName &&
    (typeof payload.displayName !== 'string' ||
      payload.displayName.trim().length === 0)
  ) {
    throw new ValidationError(
      'Display name must be a non-empty string',
      'displayName'
    );
  }

  if (payload.municipalityCode) {
    if (!validateMunicipalityCode(payload.municipalityCode)) {
      throw new ValidationError(
        'Invalid municipality code format',
        'municipalityCode'
      );
    }
  }
}

/**
 * Sanitize User Input
 * Removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 255); // Max 255 chars
}

/**
 * Validate Required Fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      'payload'
    );
  }
}
