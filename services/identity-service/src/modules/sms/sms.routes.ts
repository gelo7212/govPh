import { Router } from 'express';
import { SmsController } from './sms.controller';
import { valiateSchema } from '../../middlewares/schema.validator.middleware';
import { sendOtpSchema, verifyOtpSchema } from './sms.schema';

const router = Router();
const smsController = new SmsController();

/**
 * @route POST /sms/send
 * @description Send SMS to a phone number
 */
router.post('/send/otp', valiateSchema(sendOtpSchema), (req, res) => smsController.sendSmsOtp(req, res));
router.post('/verify/otp', valiateSchema(verifyOtpSchema), (req, res) => smsController.verifySmsCode(req, res));

export default router;
