# Texnikum Dars Jadvali — Mobil Ilova Qoidalari (Mobile Client)

Ushbu ilova **"Sirdaryo ilg'or kasbiy mahorat texnikumi"** talabalari uchun dars jadvalini ko'rishga mo'ljallangan yengil va xavfsiz mobil mijozdir.

Dasturchi: **Blitz Soft group**  
Loyiha Bosh Hujjati: `../AGENTS.md`

---

## 1. Asosiy Qoidalar (Muhim)

1. **100% Read-Only (Faqat O'qish):**
   - Ushbu ilovada admin kirish ekrani yoki admin boshqaruv paneli MAVJUD EMAS.
   - Kod bazasida Firebase Firestore'ga hech qanday yozish amallari (`setDoc`, `updateDoc`, `deleteDoc`) qo'llanilmasligi shart.
2. **Navigatsiya Arxitekturasi:**
   - Ilovada `@react-navigation/native-stack` va `@react-navigation/bottom-tabs` ishlatiladi (Expo Router EMAS).
   - Asosiy oqim: `App.tsx` orqali talaba sessiyasi tekshiriladi (`student_login` yoki `student_home`).
3. **14 Xonali JSHSHIR Bilan Kirish:**
   - Talabalar faqat 14 ta raqamdan iborat JSHSHIR bilan kirishadi (`/^\d{14}$/`).
   - `storageService.findStudentByJshshir(jshshir)` orqali Firestore'dan $O(1)$ tezlikda guruh aniqlanadi.
4. **Oflayn Kesh va Xavfsiz Chiqish:**
   - Har bir yuklangan dars jadvali `@react-native-async-storage/async-storage` ga keshlanadi.
   - Firestore `onSnapshot` orqali guruh o'chirilishi kuzatiladi; agar admin guruhni o'chirsa, ilova talabani avtomatik ogohlantirib sessiyani tozalaydi.
5. **3D Neumorphic UI & Haptics:**
   - `NeumorphicView`, `NeumorphicButton`, `NeumorphicInput` komponentlari orqali Light va Dark mavzularda ishlaydi.
   - Har bir harakatda `expo-haptics` orqali yengil tebranish beriladi.

---

## 2. Buyruqlar

```powershell
# Ishga tushirish (Expo Go)
npx expo start

# Turlarni tekshirish
npx.cmd tsc --noEmit

# Mantiqiy testlar
node scripts/test-logic.js

# Android Hermes ishlab chiqarish baytkodini tekshirish
npx.cmd expo export --platform android

# Mustaqil Android .APK fayl yaratish
npx.cmd eas-cli build -p android --profile preview
```
