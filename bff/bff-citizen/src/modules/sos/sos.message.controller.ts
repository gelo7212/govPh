import { Request, Response } from 'express';
import { MessageAggregator } from './sos.message.aggregator';
import { MessagePayload, UserRole } from './sos.message.types';

/**
 * Message Controller - Handles HTTP requests for messaging operations
 */
export class MessageController {
  private aggregator: MessageAggregator;

  constructor(aggregator: MessageAggregator) {
    this.aggregator = aggregator;
  }

  /**
   * Send a message to an SOS conversation
   * POST /:sosId/messages
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const userId = req.context?.user?.id || req.context?.user?.userId;
      const userRole = req.context?.user?.role;

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

      const { senderDisplayName, contentType, content } = req.body;

      if (!senderDisplayName || !content) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: senderDisplayName, content',
        });
        return;
      }

      const messagePayload: MessagePayload = {
        sosId,
        senderType: (userRole as UserRole) || 'CITIZEN',
        senderId: userId,
        senderDisplayName,
        contentType: contentType || 'text',
        content,
        cityId: req.context?.user?.actor?.cityCode || '',
        options: req.body.options
      };

      const message = await this.aggregator.sendMessage(sosId, messagePayload);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error sending message',
      });
    }
  }

  /**
   * Get all messages for an SOS conversation with pagination
   * GET /:sosId/messages
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { limit = '50', skip = '0' } = req.query;

      if (!sosId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: sosId',
        });
        return;
      }

      const result = await this.aggregator.getMessages(
        sosId,
        Number(skip),
        Number(limit),
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          skip: result.skip,
          limit: result.limit,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching messages',
      });
    }
  }

  /**
   * Get a single message by ID
   * GET /message/:messageId
   */
  async getMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: messageId',
        });
        return;
      }

      const message = await this.aggregator.getMessage(messageId);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching message',
      });
    }
  }

}
