import { RescuerMission, RescuerPermission } from '../../types';
import { getCollection } from '../../config/database';
import {
  NotFoundError,
  RescuerMissionExpiredError,
  RescuerMissionNotFoundError,
  DatabaseError,
} from '../../errors';
import { createLogger } from '../../utils/logger';
import mongoose from 'mongoose';

const logger = createLogger('RescuerMissionService');

/**
 * Rescuer Mission Service - Mission-based rescuer access management
 * Rescuers are NOT users - they are mission-based with time/scope limits
 */
export class RescuerMissionService {
  /**
   * Create a rescuer mission with limited-scope JWT token
   */
  async createMission(
    sosId: string,
    municipalityCode: string,
    createdByUserId: string,
    createdByRole: string,
    expiresInMinutes: number = 60
  ): Promise<RescuerMission> {
    try {
      const collection = getCollection('rescuer_missions');

      const missionId = `mission_${sosId}_${Date.now()}`;

      // Default rescuer permissions: can view, update status, send location, send message
      const permissions: RescuerPermission[] = [
        'view_sos',
        'update_status',
        'send_location',
        'send_message',
      ];

      // Generate a simple mission token (in production, use JWT)
      const token = this.generateMissionToken(missionId, sosId);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      const mission: RescuerMission = {
        id: missionId,
        sosId,
        municipalityCode,
        token,
        expiresAt,
        permissions,
        createdByUserId,
        createdByRole: createdByRole as any,
        createdAt: new Date(),
      };

      const result = await collection.insertOne({
        _id: new mongoose.Types.ObjectId(missionId),
        sosId: mission.sosId,
        municipalityCode: mission.municipalityCode,
        token: mission.token,
        expiresAt: mission.expiresAt,
        permissions: mission.permissions,
        createdByUserId: mission.createdByUserId,
        createdByRole: mission.createdByRole,
        createdAt: mission.createdAt,
      });

      if (!result.acknowledged) {
        throw new DatabaseError('Failed to create rescuer mission');
      }

      logger.info('Rescuer mission created', {
        missionId,
        sosId,
        municipalityCode,
        expiresAt: expiresAt.toISOString(),
      });

      return mission;
    } catch (error) {
      logger.error('Failed to create rescuer mission', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get active rescuer mission by SOS ID
   */
  async getMissionBySosId(sosId: string): Promise<RescuerMission | null> {
    try {
      const collection = getCollection('rescuer_missions');

      const doc = await collection.findOne({
        sosId,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      });

      if (!doc) {
        return null;
      }

      return this.mapDocToMission(doc);
    } catch (error) {
      logger.error('Failed to get mission by SOS ID', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Verify rescuer mission token
   * Returns mission if valid and active
   */
  async verifyMissionToken(token: string): Promise<RescuerMission> {
    try {
      const collection = getCollection('rescuer_missions');

      const doc = await collection.findOne({
        token,
        revokedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      });

      if (!doc) {
        throw new RescuerMissionExpiredError();
      }

      return this.mapDocToMission(doc);
    } catch (error) {
      if (error instanceof RescuerMissionExpiredError) {
        throw error;
      }
      logger.error('Failed to verify mission token', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Revoke a rescuer mission
   * Can be done by SOS admin or city admin
   */
  async revokeMission(missionId: string): Promise<void> {
    try {
      const collection = getCollection('rescuer_missions');

      const result = await collection.updateOne(
        { _id: new mongoose.Types.ObjectId(missionId), revokedAt: { $exists: false } },
        {
          $set: {
            revokedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new NotFoundError('Rescuer mission', missionId);
      }

      logger.info('Rescuer mission revoked', { missionId });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to revoke mission', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Revoke all missions for a SOS
   */
  async revokeSosMissions(sosId: string): Promise<void> {
    try {
      const collection = getCollection('rescuer_missions');

      await collection.updateMany(
        { sosId, revokedAt: { $exists: false } },
        {
          $set: {
            revokedAt: new Date(),
          },
        }
      );

      logger.info('All missions revoked for SOS', { sosId });
    } catch (error) {
      logger.error('Failed to revoke SOS missions', error);
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Generate a simple mission token
   * In production, use JWT with signing
   */
  private generateMissionToken(missionId: string, sosId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `rescuer_${sosId}_${timestamp}_${random}`;
  }

  /**
   * Map MongoDB document to RescuerMission
   */
  private mapDocToMission(doc: any): RescuerMission {
    return {
      id: doc._id,
      sosId: doc.sosId,
      municipalityCode: doc.municipalityCode,
      token: doc.token,
      expiresAt: doc.expiresAt,
      permissions: doc.permissions,
      createdByUserId: doc.createdByUserId,
      createdByRole: doc.createdByRole,
      createdAt: doc.createdAt,
      revokedAt: doc.revokedAt,
    };
  }
}

export const rescuerMissionService = new RescuerMissionService();
