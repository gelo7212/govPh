import Joi from 'joi';

/**
 * Validate form data against schema
 */
export function validateFormData(schema: any, data: any) {
  return schema.validate(data);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  return !error;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const schema = Joi.string()
    .pattern(/^\+?[0-9\s\-()]{7,}$/)
    .required();
  const { error } = schema.validate(phone);
  return !error;
}

/**
 * Validate date format
 */
export function isValidDate(date: string | Date): boolean {
  const timestamp = typeof date === 'string' ? Date.parse(date) : date.getTime();
  return !isNaN(timestamp);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Validate object ID format
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}
