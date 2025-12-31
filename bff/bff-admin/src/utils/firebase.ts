import admin from 'firebase-admin';

export const isAnonymousUserByFirebaseId = async (firebaseUid: string): Promise<boolean> => {
    try {
        const userRecord = admin.auth().getUser(firebaseUid);
        return  await userRecord.then(user => user.providerData.length === 0).catch(() => false);
    }
    catch (error) {
        return false;
    }
};

export const isAnonymousUserByFirebaseToken = async (firebaseToken: string): Promise<boolean> => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        const isAnonymous = decodedToken.firebase.sign_in_provider === 'anonymous';
        console.log(`Firebase token for UID ${decodedToken.uid} indicates as ${decodedToken.firebase.sign_in_provider} user.`);
        return isAnonymous;
    }
    catch (error) {
        console.error('Error verifying Firebase token:', error);
        return false;
    }
};

export const validateFirebaseToken = async (firebaseToken: string): Promise<admin.auth.DecodedIdToken | false> => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return false
    }
};