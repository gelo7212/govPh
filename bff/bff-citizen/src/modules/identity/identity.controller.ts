import { Request, Response } from 'express';
import { handleServiceError, sendErrorResponse } from '@gov-ph/bff-core';
import { IdentityAggregator } from './identity.aggregator';

export class IdentityController {
  private aggregator: IdentityAggregator;

  constructor(aggregator: IdentityAggregator) {
    this.aggregator = aggregator;
  }

  async getFirebaseAccount(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Firebase UID is required');
        return;
      }

      const user = await this.aggregator.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'User not found');
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User fetched successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch user account');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getToken(req: Request, res: Response): Promise<void> {
    try {
      const { firebaseUid } = req.body;
      const { firebaseToken } = req.headers;
      if (!firebaseUid) {
        sendErrorResponse(res, 400, 'INVALID_REQUEST', 'Firebase UID is required in request body');
        return;
      }

      const user = await this.aggregator.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        sendErrorResponse(res, 404, 'NOT_FOUND', 'User not found');
        return;
      }


      const result = await this.aggregator.getToken(firebaseUid, user.id);
      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to generate token');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.user?.id;
      if (!userId) {
        sendErrorResponse(res, 401, 'UNAUTHORIZED', 'User authentication required');
        return;
      }

      const profile = await this.aggregator.getProfile(userId);
      res.status(200).json({
        success: true,
        data: profile,
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Failed to fetch user profile');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Invalidate token logic
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date(),
      });
    } catch (error) {
      const errorInfo = handleServiceError(error, 'Logout failed');
      sendErrorResponse(res, errorInfo.statusCode, errorInfo.code, errorInfo.message);
    }
  }
}
