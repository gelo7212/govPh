import { Request, Response } from 'express';
import { UserEntity, RequestUser, UserRole } from '../../types';
import { userService } from './user.service';
import { inviteService } from '../../modules/invite/invite.service';
import { AuditLoggerService, logStatusChange } from '../../services/auditLogger';
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
  validateMunicipalityForRole,
  validateUserCreationPayload,
} from '../../utils/validators';
import { createLogger } from '../../utils/logger';
import { decryptEmail, decryptPhone } from '../../utils/crypto';

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


      const user: UserEntity = {
        email: req.body.email,
        phone: req.body.phone,
        displayName: req.body.displayName,
        firebaseUid: req.body.firebaseUid,
        role: 'CITIZEN',
        municipalityCode,
        municipalityId: req.body?.address?.municipalityId,
        registrationStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: {
          street: req.body?.address?.street,
          city: req.body?.address?.city,
          barangay: req.body?.address?.barangay,
          province: req.body?.address?.province,
          postalCode: req.body?.address?.postalCode,
          country: req.body?.address?.country,
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
   * Register admin user
   * Protected - only city admins can create admin users
  */
  async registerAdminUser(req: Request, res: Response): Promise<void> {
    try {
     
      const { email, phone, displayName, firebaseUid, inviteId, code } = req.body;

      const invite = await inviteService.validateInvite(inviteId);
      if (!invite.valid) {
        console.log('Invalid invite code used for admin registration:', inviteId, invite.reason);
        throw new ValidationError('Invalid or expired invite code');
      }
      
      const user: UserEntity = {
        email,
        phone,
        displayName,
        firebaseUid,
        municipalityCode: invite.municipalityCode!,
        role: invite.role as UserRole,
        registrationStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Validate payload
      validateUserCreationPayload(user);
      // Validate municipality
      const created = await userService.createUser(user);
      // Log the creation
      if (!created.id) {
        throw new DatabaseError('Failed to create user: missing id');
      }

      inviteService.acceptInvite(inviteId, code, created.id, invite.role as UserRole);
      
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
    }
    catch (error) {
      logger.error('Failed to register admin user', error);
      throw error;
    }
  }

  /**
   * GET /users/me
   * Get authenticated user's profile
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId
      const user = await userService.getUserById(userId);
      
      if (!user) {
        throw new NotFoundError('User', userId);
      }

      const requestUser = req.user as RequestUser | undefined;
      const isLoggedIn = requestUser && requestUser.userId === userId;

      if(isLoggedIn){
        if(user.phone)
          user.phone = decryptPhone(user.phone);
        if(user.email)
         user.email = decryptEmail(user.email);
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

  async getResscuerIdByCity(req: Request, res: Response): Promise<void> {
    try {
      const { municipalityCode } = req.params;
      if (!municipalityCode) {
        throw new ValidationError('Missing required parameter: municipalityCode');
      }
      const rescuers = await userService.getRescuersByMunicipality(municipalityCode);
      res.status(200).json({
        success: true,
        data: rescuers,
        timestamp: new Date(),
      });
    
    }
    catch (error) {
      logger.error('Failed to get rescuers by city', error);
      throw error;
    }
  }
}

export const userController = new UserController();
