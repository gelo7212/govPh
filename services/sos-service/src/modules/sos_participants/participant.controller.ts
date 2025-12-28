import { Request, Response } from 'express';
import { SosParticipantService } from './participant.service';
import { Types } from 'mongoose';

export class SosParticipantController {
  constructor(private service: SosParticipantService) {}

  /**
   * Join a SOS
   * POST /:sosId/participants/join
   */
  async joinSos(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { userType, userId } = req.body;

      if (!sosId || !userType || !userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sosId, userType, userId',
        });
        return;
      }

      const participant = await this.service.joinSos(
        sosId,
        userType,
        new Types.ObjectId(userId),
      );

      res.status(201).json({
        success: true,
        data: participant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error joining SOS',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Leave a SOS
   * PATCH /:sosId/participants/:userId/leave
   */
  async leaveSos(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, userId } = req.params;

      if (!sosId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sosId, userId',
        });
        return;
      }

      await this.service.leaveSos(sosId, new Types.ObjectId(userId));

      res.status(200).json({
        success: true,
        message: 'User left the SOS',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error leaving SOS',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get active participants
   * GET /:sosId/participants/active
   */
  async getActiveParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: sosId',
        });
        return;
      }

      const participants = await this.service.getActiveParticipants(sosId);

      res.status(200).json({
        success: true,
        data: participants,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching active participants',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get participant history
   * GET /:sosId/participants/history
   */
  async getParticipantHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: sosId',
        });
        return;
      }

      const history = await this.service.getParticipantHistory(sosId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching participant history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if user is active participant
   * GET /:sosId/participants/:userId/check
   */
  async checkActiveParticipation(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, userId } = req.params;

      if (!sosId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sosId, userId',
        });
        return;
      }

      const isActive = await this.service.isActiveParticipant(
        sosId,
        new Types.ObjectId(userId),
      );

      res.status(200).json({
        success: true,
        data: { isActive },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking participation status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user's participation history
   * GET /user/:userId/history
   */
  async getUserParticipationHistory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: userId',
        });
        return;
      }

      const history = await this.service.getUserParticipationHistory(
        new Types.ObjectId(userId),
      );

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user participation history',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
