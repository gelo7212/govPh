import jwt from 'jsonwebtoken';

export interface DecodedToken {
    [key: string]: any;
    iat?: number;
    exp?: number;
    iss?: string;
    sub?: string;
    actor?: {
        type: string;
        cityCode: string;
    }
}

export const decodeJWT = (token: string): DecodedToken | null => {
    try {
        const decoded = jwt.decode(token, { complete: false });
        return decoded as DecodedToken;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const decodeJWTWithHeader = (token: string) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};
