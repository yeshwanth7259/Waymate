import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = getApps()[0] || initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAqGHvazq9-iq_gPXCBKcBPoHYB8aVRjWY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'waymate-f9de0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'waymate-f9de0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'waymate-f9de0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '794586183416',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:794586183416:web:53d6873dd12a3e539b2d0d'
});

export const adminAuth = getAuth(app);
