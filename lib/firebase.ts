import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Lazy initialize Firebase (only when actually used)
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function initializeFirebase() {
  if (app) return app;

  // Only initialize on client side
  if (typeof window === 'undefined') {
    // Create a dummy app for SSR
    app = initializeApp(firebaseConfig);
    return app;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  return app;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(initializeFirebase());
  }
  return dbInstance;
}

export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(initializeFirebase());
  }
  return storageInstance;
}

export function getFirebaseApp(): FirebaseApp {
  return initializeFirebase();
}

// Legacy exports for backward compatibility
export const db = new Proxy({} as Firestore, {
  get(target, prop) {
    return getDb()[prop as keyof Firestore];
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    return getStorageInstance()[prop as keyof FirebaseStorage];
  }
});

export { app as firebaseApp };
