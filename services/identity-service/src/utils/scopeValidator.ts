/**
 * Scope Validator
 * Validates JWT scopes based on actor type and role
 * 
 * Rules:
 * - ANON + CITIZEN role: scopes OPTIONAL (in mission context)
 * - USER + CITIZEN role: scopes OPTIONAL (in actor or mission)
 * - USER + RESCUER/ADMIN roles: scopes REQUIRED (in actor)
 * - ANON + mission context: scopes in mission (optional)
 * - SYSTEM: scopes REQUIRED
 */

import { ActorType, UserRole, PERMISSION_MATRIX, Permission } from '../types';
import { createLogger } from './logger';

const logger = createLogger('ScopeValidator');

export class ScopeValidator {
  /**
   * Validate scopes for actor type and role
   * Throws error if validation fails
   * 
   * Scopes may be in actor context or mission context depending on token type
   */
  static validateScopes(
    actorType: ActorType,
    actorScopes: string[] | undefined,
    missionScopes: string[] | undefined,
    role?: UserRole
  ): void {
    // Determine if scopes are required for this actor type
    const requiresScopes = this.isScopesRequired(actorType, role);
    const availableScopes = actorScopes || missionScopes;

    if (requiresScopes) {
      // Scopes are required
      if (!availableScopes || availableScopes.length === 0) {
        const errorMsg = `Scopes are required for ${actorType}${role ? ` with role ${role}` : ''}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate scopes are non-empty strings
      if (!Array.isArray(availableScopes) || !availableScopes.every(s => typeof s === 'string' && s.trim().length > 0)) {
        const errorMsg = `Invalid scopes format for ${actorType}: scopes must be non-empty strings`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    } else {
      // Scopes are optional
      if (actorScopes !== undefined && !Array.isArray(actorScopes)) {
        const errorMsg = `Invalid scopes format for actor: scopes must be an array if provided`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      if (missionScopes !== undefined && !Array.isArray(missionScopes)) {
        const errorMsg = `Invalid scopes format for mission: scopes must be an array if provided`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    logger.debug(`Scopes validation passed for ${actorType}${role ? ` (${role})` : ''}: ${availableScopes?.join(', ') || 'none'}`);
  }

  /**
   * Determine if scopes are required for given actor type and role
   * 
   * Rules:
   * - USER + CITIZEN: scopes OPTIONAL
   * - USER + RESCUER/ADMIN: scopes REQUIRED
   * - ANON: scopes OPTIONAL (determined by role/mission context)
   * - SYSTEM: scopes REQUIRED
   */
  static isScopesRequired(actorType: ActorType, role?: UserRole): boolean {
    switch (actorType) {
      case 'USER':
        // For authenticated users, check their role
        if (role) {
          // Citizens do not require scopes
          if (role === 'CITIZEN') {
            return false;
          }
          // Rescuers and admins require scopes
          return true;
        }
        return false;

      case 'ANON':
        // Anonymous users scopes are optional (determined by mission context)
        return false;

      case 'SYSTEM':
        // System services require scopes
        return true;

      default:
        return false;
    }
  }

  /**
   * Get enabled permissions for a role
   * Returns list of permission names that role has access to
   * Single source of truth: PERMISSION_MATRIX from types
   */
  static getEnabledPermissionsForRole(role: UserRole): Permission[] {
    const permissionMap = PERMISSION_MATRIX[role];
    return Object.entries(permissionMap)
      .filter(([_, enabled]) => enabled)
      .map(([permission]) => permission as Permission);
  }

  /**
   * Get scopes from permission matrix
   * Converts permission matrix booleans to scope list
   */
  static scopesFromPermissions(permissions: Permission[]): string[] {
    return permissions.map(p => `permission:${p}`);
  }
}
