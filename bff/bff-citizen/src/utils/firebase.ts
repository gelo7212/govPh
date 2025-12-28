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
        return isAnonymous;
      
    }
    catch (error) {
        return false;
    }
};