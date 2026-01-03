import { Router, Request, Response, NextFunction } from 'express';
import { SmsService } from './sms.service';

export class SmsController {
  private smsService: SmsService;

  constructor() {
    this.smsService = new SmsService();
  }

  async sendSmsOtp(req: Request, res: Response): Promise<void> {
    try {
        const { phoneNumber, context , userId, firebaseId} = req.body;
        
        const result = await this.smsService.sendSmsOtp(phoneNumber, context, userId, firebaseId);
        res.status(200).json({
            success: result.success,
            data: { message: result.message },
            timestamp: new Date(),
        });
        return;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
         res.status(500).json(
            { 
                error: {
                    message: errorMessage,
                    code: 'SMS_VERIFICATION_FAILED'
                }
            }
        );
        return;
    }
  }

    async verifySmsCode(req: Request, res: Response): Promise<void> {
        try {
            const { phoneNumber, code, context, firebaseId, userId } = req.body;
            const isValid = await this.smsService.verifySmsCode(phoneNumber, code, context, firebaseId, userId);
            res.status(200).json(
                {
                    success: true,
                    data: { 
                        message: isValid ? 'SMS code is valid' : 'SMS code is invalid'
                    },
                    timestamp: new Date(),
            });
            return;
        } catch (error) {
            console.log('Error in verifySmsCode', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            res.status(500).json({ error: {
                message: errorMessage,
                code: 'SMS_VERIFICATION_FAILED'
            } });
            return;
        }
    }
}