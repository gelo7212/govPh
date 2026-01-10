import crypto from 'crypto';
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM
const TAG_LENGTH = 16;

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY!,
  "base64"
);
const secret = process.env.USER_SECRET!;

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error("Encryption key must be 32 bytes (AES-256)");
}


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

export const hashString = (data: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

export const compareHashString = (
    data: string,
    hashedData: string,
): boolean => {
  const hash = hashString(data);
  return hash === hashedData;
}


export const encryptData = (data: string, key: Buffer): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

export const decrypt = (payload: string, key: Buffer): string => {
  const buffer = Buffer.from(payload, "base64");

  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(buffer.length - TAG_LENGTH);
  const ciphertext = buffer.subarray(
    IV_LENGTH,
    buffer.length - TAG_LENGTH
  );

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}


export const encryptPhone = (phone: string): string => {
  return encryptData(phone, ENCRYPTION_KEY);
}

export const decryptPhone = (encryptedPhone: string): string => {
  return decrypt(encryptedPhone, ENCRYPTION_KEY);
}

export const encryptEmail = (email: string): string => {
  return encryptData(email, ENCRYPTION_KEY);
}

export const decryptEmail = (encryptedEmail: string): string => {
  return decrypt(encryptedEmail, ENCRYPTION_KEY);
}