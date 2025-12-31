import { createLogger } from "../utils/logger";
const logger = createLogger('AuthService');

export class SemaphoreSmsService  {
    private semaphoreApiKey: string;
    private semaphoreUrl: string;
    constructor() {
        this.semaphoreApiKey = process.env.SEMAPHORE_API_KEY || '';
        this.semaphoreUrl = process.env.SEMAPHORE_API_URL || 'https://semaphore.co/api/v4';
    }

    async sendOtp(phoneNumber: string, otp: string): Promise<void> {
        const message = `Your One Time Password is: ${otp}. Please use it within 5 minutes.`;
        const params = new URLSearchParams();
        params.append('apikey', this.semaphoreApiKey);
        params.append('number', phoneNumber);
        params.append('message', message);
        params.append('otp', otp);

        const response = await fetch(`${this.semaphoreUrl}/otp`, {
            method: 'POST',
            body: params,
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.warn('Failed to send SMS', errorText);
            throw new Error(`Failed to send SMS: ${errorText}`);
        }
    }

    async sendSms(phoneNumber: string, message: string): Promise<void> {
        const params = new URLSearchParams();
        params.append('apikey', this.semaphoreApiKey);
        params.append('number', phoneNumber);
        params.append('message', message);
        params.append('sendername', 'ecitizen');
        const response = await fetch(`${this.semaphoreUrl}/messages`, {
            method: 'POST',
            body: params,
        });
        if (!response.ok) {
            const errorText = await response.text();
            logger.warn('Failed to send SMS', errorText);
            throw new Error(`Failed to send SMS: ${errorText}`);
        }
    }
}
