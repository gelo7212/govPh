import { Request, Response } from 'express';
import { MessageService } from './message.service';

export class MessageController {
  constructor(private messageService: MessageService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const {
        senderType,
        senderId,
        senderDisplayName,
        contentType,
        content,
      } = req.body;
      if(!sosId){
        throw new Error('sosId is required');
      }
      
      if(senderType === 'SOS_ADMIN'){
        if(!senderId){
          res.status(400).json({
            success: false,
            message:
              'Missing required field: senderId for senderType SOS_ADMIN',
          });
          return;
        }
      }

      if (!senderType || !content) {
        res.status(400).json({
          success: false,
          message:
            'Missing required fields: senderType, content',
        });
        return;
      }

      
      const message = await this.messageService.sendMessage({
        sosId,
        senderType,
        senderId,
        senderDisplayName,
        contentType,
        content,
      });

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error sending message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sosId } = req.params;
      const { limit = '50', skip = '0' } = req.query;

      if (!sosId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: sosId',
        });
        return;
      }

      const result = await this.messageService.getMessagesBySosId(
        sosId,
        Number(skip),
        Number(limit),
      );

      res.status(200).json({
        success: true,
        data: result.messages,
        pagination: {
          total: result.total,
          skip: Number(skip),
          limit: Number(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching messages',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        res.status(400).json({
          success: false,
          message: 'Missing required field: messageId',
        });
        return;
      }

      const message = await this.messageService.getMessage(messageId);

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
