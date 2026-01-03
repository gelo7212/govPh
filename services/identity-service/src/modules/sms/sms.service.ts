
import { IdentityServiceError, InternalServiceError, SmsVerificationNumberMismatchError, VerificationGeneralError } from "../../errors";
import { SemaphoreSmsService } from "../../services/sms.semaphore.service";
import { generateOtp, compareOtp, hashOtp, hashString } from "../../utils/crypto";
import { userService } from "../user/user.service";
import { SmsOtpModel } from "./sms.otp.mongo.schema";
export class SmsService {
  private provider: SemaphoreSmsService;
  constructor() {
    this.provider = new SemaphoreSmsService();  
  }

  async sendSmsOtp(
    phoneNumber: string, 
    context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication',
    userId?: string,
    firebaseId?: string
  ): Promise<any> {
    try {
        const otp =  generateOtp();
        // format phone number to 10 digits, remove country code if present and leading zeros
        const formattedPhone = phoneNumber.replace(/^(\+63|0)/, '');
        // format number to +63XXXXXXXXXX
        const formattedE164Phone = `+63${formattedPhone}`;
        
        const hashedPhone = hashString(formattedPhone);

        // firebaeId and userId cannot be co-existing
        if(firebaseId && userId) {
            throw new VerificationGeneralError('firebaseId and userId cannot be provided together');
        }

        const user = await userService.getUserByPhone(formattedE164Phone);
     
        if(context === 'registration' && !firebaseId) {
            throw new VerificationGeneralError('firebaseId is required for registration context');
        }
        if(context !== 'registration' && !userId) {
            throw new VerificationGeneralError('userId is required for non-registration contexts');
        }
        if(context === 'registration' && firebaseId) {
            if(user) {
              throw new VerificationGeneralError('Phone number is already associated with an existing user');
            }
            const isPhoneVerified = await SmsService.isMobileNumberVerified(formattedPhone, context, firebaseId, userId);
            if(isPhoneVerified) {
                return { success: false, message: 'Phone number is already verified' , data: {}};
            }
        }

        const existingOtp = await SmsOtpModel.findOne({ phoneNumber: hashedPhone, context, status: 'sent'}).where({
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes ago
        }).sort({ createdAt: -1 });
        
        if (existingOtp) {
            const tenMinutes = 10 * 60 * 1000;
            const now = new Date();
            if (now.getTime() - existingOtp.createdAt!.getTime() < tenMinutes) {
                throw new VerificationGeneralError('An OTP has already been sent recently. Please wait before requesting a new one.');
            }
        }

        const result = await this.provider.sendOtp(phoneNumber, otp);
        const hashedOtp = hashOtp(formattedPhone, otp);
        await SmsOtpModel.create({
            phoneNumber: hashedPhone,
            otp: hashedOtp,
            context,
            status: 'sent',
            firebaseId,
            userId
        });

      return { success: true, message: 'SMS sent' , data: result };
    } catch (error) {
      if(error instanceof IdentityServiceError) throw error;
      throw new InternalServiceError('Failed to send SMS OTP');
    }
  }

  async verifySmsCode(
    phoneNumber: string, 
    code: string, 
    context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication',
    firebaseId?: string,
    userId?: string
  ): Promise<boolean> {
    try {  
        // Verify only for 3 times and within 10 minutes
        // format phone number to 10 digits, remove country code if present and leading zeros
        const formattedPhone = phoneNumber.replace(/^(\+63|0)/, '');
        const hashedCode = hashOtp(formattedPhone, code);
        const hashedPhone = hashString(formattedPhone);
        const smsOtpRecord = await SmsOtpModel.findOne(
          { 
            phoneNumber: hashedPhone, 
            otp: hashedCode, 
            status: 'sent', 
            context,
            firebaseId,
            userId
          })
        .where({
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes ago
        }).sort({ createdAt: -1 });

        if (!smsOtpRecord) {
            throw new VerificationGeneralError('Invalid or expired OTP code');
        }

        smsOtpRecord.status = 'verified';
        await smsOtpRecord.save();

        return true;
    } catch (error) {
        throw error;
    }
  }

  static async isMobileNumberVerified(
    phoneNumber: string, 
    context: 'login' | 'reset' | 'registration' | 'transaction' | 'authentication',
    firebaseId?: string,
    userId?: string
  ): Promise<boolean | Error> {
    try {
        const formattedPhone = phoneNumber.replace(/^(\+63|0)/, '');
        if(context === 'registration' && !firebaseId) {
            throw new VerificationGeneralError('firebaseId is required for registration context');
        }
        if(context !== 'registration' && !userId) {
            // throw new Error('userId is required for non-registration contexts');
            throw new VerificationGeneralError('userId is required for non-registration contexts');
        }
        
        if(context === 'registration' && firebaseId) {
          const hashedPhone = hashString(formattedPhone);
          const record = await SmsOtpModel.findOne({ phoneNumber: hashedPhone, status: 'verified', context })
          .sort({ createdAt: -1 });
          if(record && record.firebaseId !== firebaseId) {
              throw new SmsVerificationNumberMismatchError('Phone number verified with a different firebaseId');
          }

          return !!record;
        }
        throw new VerificationGeneralError('isMobileNumberVerified is only implemented for registration context');
        
    } catch (error) {
        throw error;
    }
  }
}
