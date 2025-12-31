import mongoose, { Schema, Document, mongo } from 'mongoose';

export interface ISmsOtp extends Document {
    _id: mongoose.Types.ObjectId;
    phoneNumber: string;
    otp: string;
    context:  'login' | 'reset' | 'registration' | 'transaction' | 'authentication';
    status: 'verified' | 'pending' | 'sent' | 'failed' | 'expired';
    sentAt?: Date;
    failureReason?: string;
    firebaseId?: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export const SmsOtpSchema = new mongoose.Schema(
    {
        phoneNumber: {
                type: String,
                required: true,
        },
        context: {
                type: String,
                enum: ['login', 'reset', 'registration', 'transaction', 'authentication'],
                required: true,
        },
        otp:{
                type: String,
                required: true,
        },
        status: {
                type: String,
                enum: ['verified','pending', 'sent', 'failed', 'expired'],
                default: 'pending',
        },
        sentAt: {
                type: Date,
        },
        failureReason: {
                type: String,
        },
        firebaseId: {
                type: String,
        },
        userId: {
                type: String,
        },
    },
    {
        timestamps: true,
        collection: 'sms_otps',
    }
);

export const SmsOtpModel = mongoose.model<ISmsOtp>(
  'SmsOtp',
  SmsOtpSchema
);