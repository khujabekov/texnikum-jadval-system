/**
 * Firebase Konfiguratsiyasi (Mobile Client - Read-Only)
 * 
 * Haqiqiy Firebase loyihasi: texnikum-jadval-system
 * Ushbu klient orqali talabalar faqat o'qish (read-only) huquqiga ega.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAlWeJtfamWhPEyOGYz22yOJR6JYbBnz4k',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'texnikum-jadval-system.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'texnikum-jadval-system',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'texnikum-jadval-system.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '805565106524',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:805565106524:web:fa975d611aca1d05335999',
};

let app: any = null;
let firestore: Firestore | null = null;
let isFirebaseReady = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  firestore = getFirestore(app);
  isFirebaseReady = true;
  console.log('[Firebase] Mobil ilova Firestore muvaffaqiyatli ulandi (texnikum-jadval-system)');
} catch (err) {
  console.warn('[Firebase] Mobil ilova lokal oflayn omborda ishlamoqda', err);
  isFirebaseReady = false;
}

export { app, firestore, isFirebaseReady };
