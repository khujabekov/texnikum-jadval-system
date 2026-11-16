/**
 * Firebase Konfiguratsiyasi (Web Admin Client - Read/Write)
 * 
 * Haqiqiy Firebase loyihasi: texnikum-jadval-system
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAlWeJtfamWhPEyOGYz22yOJR6JYbBnz4k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'texnikum-jadval-system.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'texnikum-jadval-system',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'texnikum-jadval-system.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '805565106524',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:805565106524:web:fa975d611aca1d05335999',
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
  console.log('[Firebase] Web Admin Firestore muvaffaqiyatli ishga tushdi (texnikum-jadval-system)');
} catch (err) {
  console.warn('[Firebase] Web Admin panel lokal demo/fallback rejimida ishlamoqda', err);
  isFirebaseReady = false;
}

export { app, firestore, auth, isFirebaseReady };
