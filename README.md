# Texnikum Dars Jadvali Tizimi (Decoupled Two-Client Architecture)

Ushbu loyiha kasb-hunar maktablari va texnikumlar uchun mo'ljallangan zamonaviy, ikkita ajratilgan mijozga ega dars jadvali axborot tizimidir:
1. **Web Admin Panel (`admin-web`):** Ma'muriyat va o'quv bo'limi uchun haftalik dars jadvallari, guruhlar va 500+ talaba JSHSHIRlarini kiritish va boshqarish interfeysi (React 19 + Vite + Tailwind CSS + Firebase Auth).
2. **Mobil Talaba Ilovasi (`texnikum-jadval`):** Talabalar uchun 14 xonali JSHSHIR orqali kiruvchi, 3D Neumorphic (Soft UI) dizayndagi, vertikal timeline va real-vaqt rejimida yangilanuvchi mobil ilova (Expo / React Native).

Ikkala platforma yagona **Firebase Firestore** bulutli ma'lumotlar bazasi orqali real-vaqt rejimida (`onSnapshot`) sinxronlashadi.

---

## Loyiha Tuzilmasi

```text
jadval_app/
├── admin-web/               # Mustaqil Web Admin Panel (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── pages/           # Boshqaruv, Guruhlar, Dars jadvali, Talabalar, Login
│   │   ├── services/        # Firestore CRUD, Batch Writes, Auth
│   │   ├── types/           # Yagona Firestore schema
│   │   └── firebase.ts      # Firebase SDK sozlamalari
│   └── package.json
│
├── texnikum-jadval/         # Mustaqil Mobil Ilova (Expo Go / React Native)
│   ├── src/
│   │   ├── screens/         # Talaba Login va Dars jadvali (Bugungi + Haftalik)
│   │   ├── components/      # 3D Neumorphic UI to'plami (Convex, Inset, Progress)
│   │   ├── services/        # Read-Only Firestore onSnapshot + AsyncStorage kesh
│   │   └── theme/           # Light / Dark rejimlari
│   ├── App.tsx              # Asosiy kirish nuqtasi
│   └── package.json
│
├── firestore.rules          # Firebase Firestore ishlab chiqarish xavfsizlik qoidalari
├── .gitignore               # Monorepo git ignor qoidalari
└── README.md                # Qo'llanma
```

---

## 1. Web Admin Panelni Ishga Tushirish (`admin-web`)

```bash
cd admin-web
npm install
npm run dev
```
Brauzerda `http://localhost:5173` manzilida ochiladi.
- **Standart kirish paroli:** `admin123` (yoki `admin`)

### Web Panel Imkoniyatlari:
- **Akademik Guruhlar:** Guruh qo'shish, kursini belgilash, tahrirlash va o'chirish.
- **Dars Jadvali Matritsasi:** 6 kunlik (Dushanba–Shanba), 1–6 paralar, vaqt, fan, o'qituvchi va xona.
- **Tezkor Nusxalash:** Bir guruh dars jadvalini boshqa guruhga bir bosishda nusxalash (kunlik yoki butun hafta).
- **Ommaviy JSHSHIR Yuklash (Bulk Import):** Matndan 14 xonali JSHSHIRlarni avtomatik ajratib oladi va Firestore `writeBatch` orqali 500+ talabani bir zumda yuklaydi.
- **Zaxira (Backup):** Barcha jadvallarni JSON fayl qilib yuklab olish va qayta tiklash.

---

## 2. Mobil Ilovani Ishga Tushirish (`texnikum-jadval`)

```bash
cd texnikum-jadval
npm install
npx expo start
```
Telefoningizdagi **Expo Go** ilovasi orqali terminalda chiqqan QR-kodni skaner qiling.

- **Sinov uchun JSHSHIR:** `12345678901234` yoki `98765432109876`
- **Jonli Sinxronizatsiya:** Admin veb-panelda dars jadvalini o'zgartirganda, talaba telefonida sahifani yangilamasdan (`onSnapshot` orqali) 0 soniyada o'zgaradi.
- **Avto-Logout:** Agar admin talabani yoki uning guruhini vebdan o'chirsa, ilova avtomatik ogohlantirib, sessiyani tozalaydi.

---

## 3. Firebase Firestore Xavfsizlik Qoidalari

Loyiha ildizidagi `firestore.rules` fayli Firebase Console -> Firestore Database -> Rules bo'limiga joylashtiriladi:
- Talabalar uchun faqat o'z JSHSHIRi bo'yicha yakka `getDoc` ruxsat etiladi (barcha talabalarni `list` qilish va scraping qat'iyan man etilgan).
- Barcha yozish va tahrirlash amallari faqat Firebase Auth dan o'tgan Admin (`request.auth != null`) uchun ochiq.

---

## Muallif va Litsenziya
O'zbekiston Respublikasi Kasb-hunar ta'limi tizimi uchun ishlab chiqilgan.
Litsenziya: MIT
