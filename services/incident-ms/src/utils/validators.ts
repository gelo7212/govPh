import { ValidationError } from '../errors';

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate incident type
 */
export function validateIncidentType(type: string): void {
  const validTypes = ['emergency', 'disaster', 'accident', 'crime', 'medical', 'other'];
  if (!validTypes.includes(type)) {
    throw new ValidationError(
      `Invalid incident type. Must be one of: ${validTypes.join(', ')}`
    );
  }
}

/**
 * Validate incident severity
 */
export function validateSeverity(severity: string): void {
  const validSeverities = ['low', 'medium', 'high'];
  if (!validSeverities.includes(severity)) {
    throw new ValidationError(
      `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
    );
  }
}

/**
 * Validate incident status
 */
export function validateIncidentStatus(status: string): void {
  const validStatuses = ['open', 'acknowledged', 'in_progress', 'resolved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Invalid incident status. Must be one of: ${validStatuses.join(', ')}`
    );
  }
}

/**
 * Validate assignment status
 */
export function validateAssignmentStatus(status: string): void {
  const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(
      `Invalid assignment status. Must be one of: ${validStatuses.join(', ')}`
    );
  }
}

/**
 * Validate geographic coordinates
 */
export function validateCoordinates(lat: number, lng: number): void {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new ValidationError('Latitude and longitude must be numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }
  if (lng < -180 || lng > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

/**
 * Validate incident creation payload
 */
export function validateIncidentCreationPayload(data: any): void {
  validateRequiredFields(data, ['type', 'title', 'severity', 'location', 'reporter']);
  
  validateIncidentType(data.type);
  validateSeverity(data.severity);
  
  if (data.location) {
    const { lat, lng, cityCode } = data.location;
    validateCoordinates(lat, lng);
    if (!cityCode) {
      throw new ValidationError('Location must include cityCode');
    }
  }

  if (data.reporter) {
    const { role } = data.reporter;
    if (!['citizen', 'guest'].includes(role)) {
      throw new ValidationError('Reporter role must be citizen or guest');
    }
  }
}

/**
 * Validate assignment creation payload
 */
export function validateAssignmentCreationPayload(data: any): void {
  validateRequiredFields(data, [
    'incidentId',
    'cityCode',
    'departmentCode',
    'assignedBy',
  ]);

  if (!['system', 'admin'].includes(data.assignedBy)) {
    throw new ValidationError('assignedBy must be either system or admin');
  }
}
