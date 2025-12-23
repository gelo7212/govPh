import { Request, Response } from 'express';
import { UserEntity, UserRole, AUTHORITY_RULES } from '../../types';
import { userService } from '../user/user.service';
import { AuditLoggerService } from '../../services/auditLogger';
import { logUserCreated } from '../../services/auditLogger';
import { getCollection } from '../../config/database';
import {
  ValidationError,
  NotFoundError,
  CannotCreateAdminError,
  UnauthorizedError,
  MunicipalityAccessDeniedError,
} from '../../errors';
import {
  validateEmail,
  validateMunicipalityForRole,
  validateUserCreationPayload,
} from '../../utils/validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AdminController');

/**
 * Admin Controller - Handles admin user management
 * Enforces strict authority rules
 */
export class AdminController {
  private auditLogger: AuditLoggerService;

  constructor() {
    this.auditLogger = new AuditLoggerService(getCollection('audit_logs'));
  }

  /**
   * POST /admin/users
   * Create a new admin user (city_admin or sos_admin)
   * Only app_admin and city_admin can create admins
   *
   * app_admin can create: city_admin, sos_admin
   * city_admin can create: sos_admin (in their municipality only)
   */
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const {
        role,
        email,
        phone,
        displayName,
        municipalityCode,
        department,
      } = req.body;

      // Validation
      if (!role || !email) {
        throw new ValidationError('Missing required fields: role, email');
      }

      if (!['city_admin', 'sos_admin'].includes(role)) {
        throw new ValidationError(
          'Invalid admin role. Must be: city_admin or sos_admin',
          'role'
        );
      }

      // Authority check: Can creator create this role?
      const allowedRoles = AUTHORITY_RULES[req.user.role];
      if (!allowedRoles.includes(role)) {
        throw new CannotCreateAdminError(req.user.role, role);
      }

      // Email validation
      if (!validateEmail(email)) {
        throw new ValidationError('Invalid email format', 'email');
      }

      // Municipality validation
      validateMunicipalityForRole(role, municipalityCode);

      // Municipality scope check (city_admin cannot cross boundaries)
      if (
        req.user.role === 'city_admin' &&
        municipalityCode !== req.user.municipalityCode
      ) {
        throw new MunicipalityAccessDeniedError(
          req.user.municipalityCode || '',
          municipalityCode || ''
        );
      }

      // Validate payload
      validateUserCreationPayload({
        email,
        phone,
        displayName,
        municipalityCode,
      });

      // Check if user with this email already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('USER_ALREADY_EXISTS');
      }

      // Create the admin user
      const userId = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const newAdmin: UserEntity = {
        id: userId,
        firebaseUid: `pending_${userId}`, // Will be updated when user claims account
        role: role as UserRole,
        email,
        phone,
        displayName,
        municipalityCode,
        department: department as any,
        registrationStatus: 'pending', // Awaiting email confirmation
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userService.createUser(newAdmin);

      // Log the creation
      await logUserCreated(
        this.auditLogger,
        req.user.userId,
        req.user.role,
        userId,
        role as UserRole,
        municipalityCode
      );

      // TODO: Send invitation email to admin

      res.status(201).json({
        success: true,
        data: {
          id: newAdmin.id,
          role: newAdmin.role,
          email: newAdmin.email,
          displayName: newAdmin.displayName,
          municipalityCode: newAdmin.municipalityCode,
          registrationStatus: newAdmin.registrationStatus,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to create admin', error);
      throw error;
    }
  }

  /**
   * GET /admin/users
   * List all users in requester's scope
   * app_admin sees all users
   * city_admin and sos_admin see users in their municipality
   */
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      let users: UserEntity[] = [];

      if (req.user.role === 'app_admin') {
        // App admin sees all users - not implemented yet for full scope
        users = [];
      } else if (
        req.user.role === 'city_admin' ||
        req.user.role === 'sos_admin'
      ) {
        // City admin and SOS admin see users in their municipality
        if (!req.user.municipalityCode) {
          throw new Error('INVALID_MUNICIPALITY_SCOPE');
        }

        users = await userService.getUsersByMunicipality(
          req.user.municipalityCode
        );
      }

      // Log the action
      await this.auditLogger.log(
        req.user.userId,
        req.user.role,
        'view_users',
        {
          municipalityCode: req.user.municipalityCode,
          count: users.length,
        }
      );

      res.status(200).json({
        success: true,
        data: users,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to list users', error);
      throw error;
    }
  }

  /**
   * GET /admin/audit-logs
   * Retrieve audit logs (app_admin only for now)
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { startDate, endDate, limit } = req.query;

      const logs = await this.auditLogger.getAuditLogs({
        municipalityCode:
          req.user.role === 'app_admin'
            ? undefined
            : req.user.municipalityCode,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 100,
      });

      res.status(200).json({
        success: true,
        data: logs,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to get audit logs', error);
      throw error;
    }
  }
}

export const adminController = new AdminController();
