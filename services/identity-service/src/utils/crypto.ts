import crypto from 'crypto';

export const hashOtp = (
  phone: string,
  otp: string
): string => {
  return crypto
    .createHmac('sha256', process.env.OTP_SECRET!)
    .update(`${phone}:${otp}`)
    .digest('hex');
}

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
}

export const compareOtp = (
    phone: string,
    otp: string,
    hashedOtp: string,
): boolean => {
  const hash = hashOtp(phone, otp);
  return hash === hashedOtp;
}