import jwt from 'jsonwebtoken';

export interface DecodedToken {
    [key: string]: any;
    iss: string;
    aud: string;
    exp: number;
    identity: {
        userId: string;
        firebaseUid: string;
        role: string;
        scopes: string[];
    };
    actor: {
        type: string;
        cityCode: string;
    };
    tokenType: string;
}

export const decodeJWT = (token: string): DecodedToken | null => {
    try {
        
        const publicKey = process.env.JWT_PUBLIC_KEY;
        if (!publicKey) {
            throw new Error('JWT_PUBLIC_KEY environment variable is not set');
        }
        const decodedToken = jwt.verify(token, publicKey) as any;
        return decodedToken as DecodedToken;
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
