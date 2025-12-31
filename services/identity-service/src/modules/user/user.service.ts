import { UserEntity, RegistrationStatus } from '../../types';
import { getCollection } from '../../config/database';
import { SmsService } from '../sms';  
import {
  NotFoundError,
  UserAlreadyExistsError,
  DatabaseError,
} from '../../errors';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('UserService');

/**
 * User Service - Core user management operations
 */
export class UserService {
  /**
   * Create a new user
   */
  async createUser(user: UserEntity): Promise<UserEntity> {
    try {
      const collection = getCollection('users');

      // Check if user already exists by firebaseUid or email
      const existing = await collection.findOne({
        $or: [
          { firebaseUid: user.firebaseUid },
          { email: user.email && { email: user.email } },
        ].filter(f => f),
      });

      if (existing) {
        throw new UserAlreadyExistsError(
          user.email || user.firebaseUid
        );
      }

      if(user.role === 'CITIZEN') {
        if(!user.phone) {
          throw new Error('Phone number is required for citizen registration');
        }
        
        const isVerified = await SmsService.isMobileNumberVerified(user.phone, 'registration', user.firebaseUid, user.id);
        if(!isVerified) {
          throw new Error('Phone number not verified for citizen registration');
        }
       
       
      }

      const result = await collection.insertOne({
        _id: new mongoose.Types.ObjectId(),
        firebaseUid: user.firebaseUid,
        role: user.role,
        email: user.email,
        phone: user.phone,
        displayName: user.displayName,
        municipalityCode: user.municipalityCode,
        municipalityId: user.municipalityId,
        department: user.department,
        registrationStatus: user.registrationStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        address: user.address,
      });

      if (!result.acknowledged) {
        throw new DatabaseError('Failed to create user');
      }

      logger.info('User created', {
        userId: user.id,
        firebaseUid: user.firebaseUid,
        role: user.role,
      });

      return user;
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }
      logger.error('Failed to create user', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserEntity | null> {
    try {
      const collection = getCollection('users');
      const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });

      if (!doc) {
        return null;
      }

      return this.mapDocToEntity(doc);
    } catch (error) {
      logger.error('Failed to get user by ID', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get user by phone number
  */
  async getUserByPhone(phone: string): Promise<UserEntity | null> {
    try {
      const collection = getCollection('users');
      const doc = await collection.findOne({ phone });

      if (!doc) {
        return null;
      }
      return this.mapDocToEntity(doc);
    } catch (error) {
      logger.error('Failed to get user by phone number', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  
  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserEntity | null> {
    try {
      const collection = getCollection('users');
      const doc = await collection.findOne({ firebaseUid });

      if (!doc) {
        return null;
      }

      return this.mapDocToEntity(doc);
    } catch (error) {
      logger.error('Failed to get user by Firebase UID', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    try {
      const collection = getCollection('users');
      const doc = await collection.findOne({ email });

      if (!doc) {
        return null;
      }

      return this.mapDocToEntity(doc);
    } catch (error) {
      logger.error('Failed to get user by email', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get all admins in a municipality
   */
  async getAdminsByMunicipality(
    municipalityCode: string
  ): Promise<UserEntity[]> {
    try {
      const collection = getCollection('users');
      const docs = await collection
        .find({
          municipalityCode,
          role: { $in: ['city_admin', 'sos_admin'] },
        })
        .toArray();

    return (docs).map(doc => this.mapDocToEntity(doc));
    } catch (error) {
      logger.error('Failed to get admins by municipality', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get all users in a municipality
   */
  async getUsersByMunicipality(
    municipalityCode: string
  ): Promise<UserEntity[]> {
    try {
      const collection = getCollection('users');
      const docs = await collection
        .find({ municipalityCode })
        .toArray();

      return docs.map(doc => this.mapDocToEntity(doc));
    } catch (error) {
      logger.error('Failed to get users by municipality', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Update user registration status
   */
  async updateUserStatus(
    userId: string,
    status: RegistrationStatus
  ): Promise<UserEntity> {
    try {
      const collection = getCollection('users');

      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            registrationStatus: status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result?.value) {
        throw new NotFoundError('User', userId);
      }

      logger.info('User status updated', {
        userId,
        newStatus: status,
      });

      return this.mapDocToEntity(result.value);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to update user status', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get all app admins
   */
  async getAllAppAdmins(): Promise<UserEntity[]> {
    try {
      const collection = getCollection('users');
      const docs = await collection
        .find({ role: 'app_admin' })
        .toArray();

      return docs.map(doc => this.mapDocToEntity(doc));
    } catch (error) {
      logger.error('Failed to get app admins', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Map MongoDB document to UserEntity
   */
  private mapDocToEntity(doc: any): UserEntity {
    return {
      id: doc._id,
      firebaseUid: doc.firebaseUid,
      role: doc.role,
      email: doc.email,
      phone: doc.phone,
      displayName: doc.displayName,
      municipalityCode: doc.municipalityCode,
      department: doc.department,
      registrationStatus: doc.registrationStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      address: doc.address,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
