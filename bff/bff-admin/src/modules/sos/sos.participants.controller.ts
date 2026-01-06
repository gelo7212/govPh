import { Request, Response } from 'express';
import { SosParticipantsAggregator } from './sos.participants.aggregator';

/**
 * Participants Controller - BFF Admin
 * Handles HTTP requests for participant operations
 */
export class SosParticipantsController {
  constructor(private aggregator: SosParticipantsAggregator) {}

  /**
   * Join a SOS as a participant
   * POST /:sosId/participants/join
   */
  async joinSos(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const userId = req.context?.user?.id || req.context?.user?.userId;
      const userRole = req.context?.user?.role;
      const actorType = req.context?.user?.actor?.type;

      if (!sosId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: sosId',
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID required',
        });
        return;
      }

      // Map role to userType for participant system
      const userType = req.body.userType || userRole || 'admin';

      const result = await this.aggregator.joinSos(sosId, {
        userType,
        userId,
        actorType,
      });

      res.status(201).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error joining SOS',
      });
    }
  }

  /**
   * Leave a SOS participation
   * PATCH /:sosId/participants/:userId/leave
   */
  async leaveSos(req: Request, res: Response): Promise<void> {
    try {
      const { sosId, userId } = req.params;

      if (!sosId || !userId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: sosId, userId',
        });
        return;
      }

      const result = await this.aggregator.leaveSos(sosId, userId);

      res.status(200).json({
        success: true,
        message: 'Participant left SOS',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error leaving SOS',
      });
    }
  }

  /**
   * Get active participants in a SOS
   * GET /:sosId/participants/active
   */
  async getActiveParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: sosId',
        });
        return;
      }

      const participants = await this.aggregator.getActiveParticipants(sosId);

      res.status(200).json({
        success: true,
        data: participants,
        count: participants.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching active participants',
      });
    }
  }

  /**
   * Get participant history for a SOS
   * GET /:sosId/participants/history
   */
  async getParticipantHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;

      if (!sosId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: sosId',
        });
        return;
      }

      const history = await this.aggregator.getParticipantHistory(sosId);

      res.status(200).json({
        success: true,
        data: history,
        count: history.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching participant history',
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
          error: 'Missing required parameters: sosId, userId',
        });
        return;
      }

      const isActive = await this.aggregator.isActiveParticipant(sosId, userId);

      res.status(200).json({
        success: true,
        data: { isActive },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error checking participation status',
      });
    }
  }

  /**
   * Get user's participation history
   * GET /user/:userId/history
   */
  async getUserParticipationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: userId',
        });
        return;
      }

      const history = await this.aggregator.getUserParticipationHistory(userId);

      res.status(200).json({
        success: true,
        data: history,
        count: history.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching user participation history',
      });
    }
  }
}
