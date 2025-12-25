import { Request, Response } from 'express';
import { UserEntity, RequestUser } from '../../types';
import { userService } from './user.service';
import { AuditLoggerService } from '../../services/auditLogger';
import { logUserCreated, logStatusChange } from '../../services/auditLogger';
import { getCollection } from '../../config/database';
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  UnauthorizedError,
  CannotCreateAdminError,
  UserNotRegisteredError,
} from '../../errors';
import {
  validateEmail,
  validateMunicipalityForRole,
  validateUserCreationPayload,
} from '../../utils/validators';
import { createLogger } from '../../utils/logger';

const logger = createLogger('UserController');

/**
 * User Controller - Handles user-related HTTP requests
 */
export class UserController {
  private auditLogger: AuditLoggerService | null = null;

  private getAuditLogger(): AuditLoggerService {
    if (!this.auditLogger) {
      this.auditLogger = new AuditLoggerService(getCollection('audit_logs'));
    }
    return this.auditLogger;
  }

  /**
   * POST /users/register
   * Citizen self-registration endpoint
   * Requires Firebase authentication token
   */
  async registerCitizen(req: Request, res: Response): Promise<void> {
    try {
      const { municipalityCode } = req.body;

      // Citizens can register for their municipality
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const user: UserEntity = {
        email: req.body.email,
        phone: req.body.phone,
        displayName: req.body.displayName,
        id: userId,
        firebaseUid: req.body.firebaseUid,
        role: 'CITIZEN',
        municipalityCode,
        registrationStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: {
          street: req.body.street,
          city: req.body.city,
          barangay: req.body.barangay,
          province: req.body.province,
          postalCode: req.body.postalCode,
          country: req.body.country,
        },
      };

      // Validate municipality if provided
      if (municipalityCode) {
        validateMunicipalityForRole('CITIZEN', municipalityCode);
      }

      const created = await userService.createUser(user);

      res.status(201).json({
        success: true,
        data: {
          id: created.id,
          firebaseUid: created.firebaseUid,
          role: created.role,
          municipalityCode: created.municipalityCode,
          registrationStatus: created.registrationStatus,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to register citizen', error);
      throw error;
    }
  }

  /**
   * GET /users/me
   * Get authenticated user's profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const user = await userService.getUserById(req.user.userId);

      if (!user) {
        throw new NotFoundError('User', req.user.userId);
      }

      res.status(200).json({
        success: true,
        data: user,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to get user profile', error);
      throw error;
    }
  }

  /**
   * PATCH /users/status
   * Update user registration status (admin only)
   * app_admin and city_admin can suspend/activate users
   */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { userId, status } = req.body;

      if (!userId || !status) {
        throw new ValidationError('Missing required fields: userId, status');
      }

      if (!['active', 'suspended', 'archived'].includes(status)) {
        throw new ValidationError(
          'Invalid status. Must be: active, suspended, or archived',
          'status'
        );
      }

      // Verify target user exists
      const targetUser = await userService.getUserById(userId);
      if (!targetUser) {
        throw new NotFoundError('User', userId);
      }

      // Update status
      const updated = await userService.updateUserStatus(userId, status);

      // Log the action
      await logStatusChange(
        this.getAuditLogger(),
        req.user.userId,
        req.user.role,
        userId,
        status,
        req.user.municipalityCode
      );

      res.status(200).json({
        success: true,
        data: updated,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to update user status', error);
      throw error;
    }
  }

  async getUserByFirebaseUid(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        throw new ValidationError('Missing required parameter: firebaseUid');
      }
      const user = await userService.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        throw new UserNotRegisteredError(firebaseUid);
      }
      res.status(200).json({
        success: true,
        data: user,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Failed to get user by Firebase UID', error);
      throw error;
    }
  }

  async checkFirebaseUidExists(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        throw new ValidationError('Missing required parameter: firebaseUid');
      }
      const exists = await userService.getUserByFirebaseUid(firebaseUid);
      res.status(200).json({
        success: true,
        data: { exists },
        timestamp: new Date(),
      });
    }
    catch (error) {
      logger.error('Failed to check Firebase UID existence', error);
      throw error;
    }

  }
}

export const userController = new UserController();
