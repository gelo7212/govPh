import * as admin from 'firebase-admin';
import * as path from 'path';

/**
 * Initialize Firebase Admin SDK
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable pointing to service account JSON file
 * or FIREBASE_ADMIN_SDK_KEY with the JSON content as a base64 encoded string
 */
export function initializeFirebase(): void {
  try {
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      return;
    }

    // Try to get service account from environment variables
    let serviceAccount: any;

    // First, try to load from file path
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (keyPath) {
      try {
        serviceAccount = require(path.resolve(keyPath));
        console.log('Loaded Firebase service account from file:', keyPath);
      } catch (error) {
        console.error('Failed to load Firebase service account from file:', error);
      }
    }

    // If file path didn't work, try to load from base64 encoded string
    if (!serviceAccount) {
      const keyBase64 = process.env.FIREBASE_ADMIN_SDK_KEY;
      if (keyBase64) {
        try {
          const keyString = Buffer.from(keyBase64, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(keyString);
          console.log('Loaded Firebase service account from base64 encoded environment variable');
        } catch (error) {
          console.error('Failed to load Firebase service account from environment variable:', error);
        }
      }
    }

    if (!serviceAccount) {
      console.warn(
        'Firebase service account not configured. Firebase token validation will not work. ' +
        'Set either FIREBASE_SERVICE_ACCOUNT_KEY (path to JSON file) or FIREBASE_ADMIN_SDK_KEY (base64 encoded JSON)'
      );
      return;
    }

    // Initialize Firebase Admin SDK with service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export function getAuth() {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin SDK is not initialized. Make sure initializeFirebase() is called before using Firebase services.');
  }
  return admin.auth();
}
