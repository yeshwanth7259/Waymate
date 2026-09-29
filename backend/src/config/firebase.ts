import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const serviceAccountPath = path.resolve(__dirname, '../../../firebase-service-account.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    console.log("Firebase Admin initialized using service account JSON.");
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    console.log("Firebase Admin initialized using Environment Variables.");
  } else {
    if (process.env.NODE_ENV !== 'development') {
      console.warn("WARNING: Firebase credentials not found in production environment. Running in bypass mode.");
    } else {
      console.warn("Firebase credentials not found. Using development bypass.");
    }
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

export const auth = getApps().length > 0 ? getAuth() : undefined;

