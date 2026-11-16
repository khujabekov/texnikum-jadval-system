/**
 * Firebase Konfiguratsiyasi (Mobile Client - Read-Only)
 * 
 * Ushbu fayl Firebase Console'dan olingan loyiha kalitlarini qabul qiladi.
 * Agar kalitlar kiritilmagan bo'lsa, Expo Go'da darhol ishga tushishi uchun
 * xavfsiz oflayn/lokal fallback rejimida ishlaydi.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// ============================================================================
// FIREBASE SOZLAMALARI:
// Firebase Console -> Project Settings -> General -> Your apps -> Web SDK sozlamalarini
// quyidagi maydonlarga joylashtiring yoki .env faylidan foydalaning.
// ============================================================================
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoTexnikumScheduleApp2026Key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'texnikum-jadval.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'texnikum-jadval',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'texnikum-jadval.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1029384756:web:abcdef123456',
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
} catch {
  console.log('[Firebase] Mobil ilova lokal oflayn omborda ishlamoqda');
  isFirebaseReady = false;
}

export { app, firestore, isFirebaseReady };
