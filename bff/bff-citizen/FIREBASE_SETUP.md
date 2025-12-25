# Firebase Admin SDK Setup for BFF Citizen

## Overview
The BFF Citizen service now validates Firebase tokens in the Authorization header. You need to set up Firebase Admin SDK with your Firebase service account credentials.

## Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### 2. Configure Firebase Credentials

There are two ways to configure Firebase credentials:

#### Option A: Local Development (File Path)
1. Save the service account JSON file to your project directory
   ```bash
   cp /path/to/firebase-service-account.json ./firebase-service-account.json
   ```

2. Update `.env`:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
   ```

#### Option B: Docker/CI Environment (Base64)
Useful when you can't mount files directly:

1. Encode the service account JSON as base64:
   ```bash
   cat firebase-service-account.json | base64
   ```

2. Set the environment variable:
   ```bash
   export FIREBASE_ADMIN_SDK_KEY=<base64-encoded-json>
   ```

3. Update `.env` (in docker-compose or CI pipeline):
   ```
   FIREBASE_ADMIN_SDK_KEY=<base64-encoded-json>
   ```

### 3. Install Dependencies

```bash
npm install
# or if using yarn workspaces
yarn install
```

### 4. Test the Setup

Start the service:
```bash
npm run dev
```

You should see in the logs:
```
Firebase Admin SDK initialized successfully
```

## Usage

When a client makes a request to the register endpoint with a valid Firebase token:

```bash
curl -X POST http://localhost:3000/api/identity/register \
  -H "Authorization: Bearer <firebase-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+1234567890",
    "displayName": "John Doe",
    "firebaseUid": "firebase-uid",
    "address": {
      "street": "123 Main St",
      "city": "Manila",
      "barangay": "Barangay 1",
      "province": "Metro Manila",
      "postalCode": "1000",
      "country": "Philippines"
    }
  }'
```

## Troubleshooting

### "Firebase service account not configured"
- Make sure either `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_ADMIN_SDK_KEY` is set
- Check that the file path is correct (relative to the working directory)
- For base64, ensure it's properly encoded

### "Invalid service account"
- Verify the JSON file is valid and from your Firebase project
- Check that the project ID matches your Firebase project

### "Token validation failed"
- Ensure the token is a valid Firebase ID token
- Check that the token hasn't expired
- Verify the Authorization header format: `Authorization: Bearer <token>`

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | String (path) | Path to Firebase service account JSON file |
| `FIREBASE_ADMIN_SDK_KEY` | String (base64) | Base64-encoded Firebase service account JSON |
| `IDENTITY_SERVICE_URL` | String (URL) | URL of the identity microservice |
