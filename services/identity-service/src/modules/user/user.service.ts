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
import { decryptPhone, encryptPhone, hashString } from '../../utils/crypto';

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

      // Generate ID for the new user
      const userId = new mongoose.Types.ObjectId();

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
        _id: userId,
        firebaseUid: user.firebaseUid,
        role: user.role,
        email: user.email ? encryptPhone(user.email) : undefined,
        emailHashed: user.email ? hashString(user.email) : undefined,
        phone: user.phone ? encryptPhone(user.phone) : undefined,
        phoneHashed: user.phone ? hashString(user.phone) : undefined,
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
        userId: userId.toString(),
        firebaseUid: user.firebaseUid,
        role: user.role,
      });

      return { ...user, id: userId.toString() };
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
      console.log('Fetched user doc:', doc);
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
      const doc = await collection.findOne({ phoneHashed: hashString(phone) });

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
    municipalityCode: string,
    role?: string
  ): Promise<UserEntity[]> {
    try {
      const collection = getCollection('users');
      if(role) {
        const docs = await collection
          .find({ municipalityCode, role })
          .toArray();
        
        const data = (docs).map(doc => this.mapDocToEntity(doc));
        data.map(docs =>{
          docs.phone = decryptPhone(docs.phone!);
          return docs;
        })
        return data;
      } else {
        const docs = await collection
          .find({ municipalityCode, role: { $in: ['city_admin', 'sos_admin', 'sk_admin'] } })
          .toArray();
          
        const data = (docs).map(doc => this.mapDocToEntity(doc));
        data.map(docs =>{
          docs.phone = decryptPhone(docs.phone!);
          return docs;
        })
        return data;
      }
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

      if (!result) {
        throw new NotFoundError('User', userId);
      }

      logger.info('User status updated', {
        userId,
        newStatus: status,
      });

      return this.mapDocToEntity(result);
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

  async assignRole(userId: string, role: string): Promise<UserEntity> {
    try {
      const collection = getCollection('users');
      const result = await collection.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { role, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );  
      if (!result) {
        throw new NotFoundError('User', userId);
      }
      return this.mapDocToEntity(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to assign role to user', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
  async disableUser(userId: string): Promise<UserEntity> {
    try {
      const collection = getCollection('users');
      const result = await collection.findOneAndUpdate( 
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { registrationStatus: 'DISABLED', updatedAt: new Date() } },
        { returnDocument: 'after' }
      ); 
      if (!result) {
        throw new NotFoundError('User', userId);
      }
      return this.mapDocToEntity(result);
    }
    catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to disable user', error);
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
