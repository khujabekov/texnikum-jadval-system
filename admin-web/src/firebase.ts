/**
 * Firebase Konfiguratsiyasi (Web Admin Client - Read/Write)
 * 
 * Firebase Console -> Project Settings -> General -> Your apps -> Web SDK
 * sozlamalarini quyidagi maydonlarga joylashtiring yoki VITE_FIREBASE_* env o'zgaruvchilarini belgilang.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoTexnikumScheduleApp2026Key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'texnikum-jadval.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'texnikum-jadval',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'texnikum-jadval.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:abcdef123456',
};

let app: any = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseReady = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  firestore = getFirestore(app);
  auth = getAuth(app);
  isFirebaseReady = true;
} catch {
  console.log('[Firebase] Web Admin panel lokal demo/fallback rejimida ishlamoqda');
  isFirebaseReady = false;
}

export { app, firestore, auth, isFirebaseReady };
