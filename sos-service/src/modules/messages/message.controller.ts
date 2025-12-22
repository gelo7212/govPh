import { Request, Response } from 'express';
import { MessageService } from './message.service';

export class MessageController {
  constructor(private messageService: MessageService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await this.messageService.sendMessage(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { sosId , cityId} = req.params;
      const messages = await this.messageService.getMessagesBySOS(cityId, sosId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
