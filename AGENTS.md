# Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi — Dars Jadvali Tizimi
# Loyiha Xotirasi (Project Brain & Architecture Reference)

Ushbu hujjat **"Sirdaryo ilg'or kasbiy mahorat texnikumi"** dars jadvali axborot tizimining arxitekturasi, ma'lumotlar bazasi sxemasi, xavfsizlik choralari, ishlab chiqish va ishlab chiqarish (production) bo'yicha yagona rasmiy manbasi hisoblanadi.

Dasturiy ta'minot: **Blitz Soft group**  
Asosiy ombor: `https://github.com/khujabekov/texnikum-jadval-system.git`

---

## 1. Tizim Arxitekturasi (Decoupled Monorepo)

Loyiha yagona Google Firebase bulutli bazasiga ulangan **ikkita mustaqil mijoz (Decoupled Two-Client Architecture)** monoreposidan iborat:

```
jadval_app/
├── admin-web/               # Web Admin Panel (React 19 + Vite 8 + Tailwind CSS v4)
├── texnikum-jadval/         # Mobil Talaba Ilovasi (React Native + Expo SDK 58)
├── firestore.rules          # Google Cloud Firestore Xavfsizlik Qoidalari
├── README.md                # Loyiha umumiy tanishtiruvi
├── AGENTS.md                # Tizimning to'liq arxitektura miyasi (ushbu hujjat)
└── .gitignore               # Xavfsiz global filtr (node_modules, .env fayllar)
```

### Arxitektura Tamoyillari:
1. **Mobil Ilova 100% O'qish Rejimida (Read-Only):** Mobil ilovada hech qanday ma'muriy (Admin) menyu, admin marshruti yoki bazaga yozish (`setDoc`, `updateDoc`, `deleteDoc`) ruxsati mavjud emas. Bu talabalar tomonidan tizimni buzish yoki noqonuniy o'zgartirish kiritish xavfini nolga tenglashtiradi.
2. **Web Admin Panel Yagona Boshqaruv Markazi:** Barcha guruhlar, jadvallar va talabalar faqat Web panel orqali Firebase Auth bilan himoyalangan admin tomonidan boshqariladi.
3. **Real Vaqt Sinxronizatsiyasi:** Web panelda qilingan har qanday o'zgartirish Firestore `onSnapshot` orqali talabaning telefonida o'sha soniyaning o'zidayoq aks etadi.

---

## 2. Google Firebase Firestore Sxemasi

Firebase loyihasi: `texnikum-jadval-system`

### 1. `groups/{groupId}`
Texnikum guruhlari ro'yxati.
```typescript
interface GroupDoc {
  id: string;          // Masalan: 'grp_21_24_at'
  name: string;        // Masalan: '21-24 AT guruhi'
  department: string;  // Masalan: 'Axborot texnologiyalari'
  courseYear: number;  // 1, 2, 3 yoki 4-kurs
  createdAt?: string;  // ISO sana
}
```

### 2. `students/{jshshir}`
Talabalarning 14 xonali JSHSHIR hujjati.
- **Muhim mezon:** Hujjat ID'si aynan 14 xonali JSHSHIR satri hisoblanadi.
- Bu orqali talaba tizimga kirayotganda butun bazani qidirmaydi, balki to'g'ridan-to'g'ri `doc(db, 'students', jshshir)` orqali bir zumda **$O(1)$ tezlikda** o'z guruhini topadi.
```typescript
interface StudentDoc {
  jshshir: string;     // Qat'iy 14 ta raqam: /^\d{14}$/
  groupId: string;     // Biriktirilgan guruh ID si
  groupName: string;   // Guruh nomi kesh sifatida
  fullName?: string;   // Talaba F.I.SH (ixtiyoriy)
  enrolledAt?: string; // Ro'yxatga olingan sana
  updatedAt?: string;  // Yangilangan sana
}
```

### 3. `schedules/{groupId}_{dayOfWeek}`
Haftalik dars jadvali.
- Hujjat ID formati: `{groupId}_{dayOfWeek}` (masalan: `grp_21_24_at_1` — Dushanba kuni jadvali).
- Kun raqami: `1` = Dushanba, `2` = Seshanba, `3` = Chorshanba, `4` = Payshanba, `5` = Juma, `6` = Shanba.
```typescript
interface ScheduleDoc {
  groupId: string;
  dayOfWeek: number;   // 1 dan 6 gacha
  lessons: Array<{
    id: string;
    paraNumber: number; // 1, 2, 3, 4, 5, 6-para
    pairNumber?: number;// Orqaga moslik uchun
    timeRange: string;  // "08:30 - 09:50"
    subjectName: string;// "Kompyuter tarmoqlari"
    teacherName: string;// "Oripov S."
    roomNumber: string; // "204"
  }>;
  updatedAt?: string;
}
```

---

## 3. Xavfsizlik Qoidalari (`firestore.rules`)

Production darajasidagi xavfsizlik:
1. **Scraping Taqiqlangan:** Talabalar kolleksiyasida `allow list: if false` qilingan — begona shaxslar barcha talabalar JSHSHIR ro'yxatini birdaniga yuklab ololmaydi. Faqat o'zining 14 xonali JSHSHIR hujjati bo'yicha yakka `get` ruxsat etiladi.
2. **Admin Yozish Huquqi:** Faqat Firebase Authentication orqali tizimga kirgan admin foydalanuvchilar (`request.auth != null`) ma'lumotlarni qo'shishi, o'zgartirishi yoki o'chirishi mumkin.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null;
    }
    function is14Digits(str) {
      return str.matches('^[0-9]{14}$');
    }

    match /groups/{groupId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /schedules/{scheduleId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /students/{jshshir} {
      allow get: if is14Digits(jshshir);
      allow list: if isAdmin();
      allow write: if isAdmin();
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Web Admin Panel (`admin-web`)

- **Texnologiyalar:** React 19, Vite 8, TypeScript, Tailwind CSS v4, Lucide Icons, Firebase JS SDK.
- **Asosiy Sahifalar va Imkoniyatlar:**
  1. **DashboardPage:** Guruhlar, darslar va talabalar statistikasi; **"Bazani to'ldirish (Seed Cloud)"** tugmasi orqali Firestore'ga namunaviy jadvallarni bir klikda yuklash.
  2. **GroupsPage:** Yangi guruh ochish, tahrirlash va kaskadli o'chirish (guruh o'chirilganda unga tegishli jadvallar va talabalar avtomatik tozalanadi).
  3. **SchedulePage:** 
     - Har bir guruh uchun haftaning 6 kuni bo'yicha paralar kiritish.
     - **Tezkor Nusxalash:** Bitta guruh jadvalini ikkinchi guruhga bir kunlik yoki butun haftalik ko'chirib o'tkazish.
     - **A4 PDF Chop Etish (Print):** Guruhning haftalik dars jadvalini vazirlik standarti, rasmiy blanka, jadvallar va imzo/muhr bloklari bilan A4 formatda PDF saqlash yoki printerdan chiqarish (`window.print()`).
  4. **StudentsPage:**
     - 500+ talaba JSHSHIRlarini bir zumda matndan ajratib yuklash (Firestore 450 talik chunked `writeBatch`).
     - Takroriy (dublikat) yoki noto'g'ri JSHSHIRlarni avtomatik aniqlash va hisobot berish.
  5. **Zaxira (Backup):** Barcha ma'lumotlarni JSON formatda kompyuterga yuklab olish va tiklash.

### Ishga tushirish:
```powershell
cd admin-web
npm run dev      # http://localhost:5173
npm run build    # dist/ ishlab chiqarish
```

---

## 5. Mobil Talaba Ilovasi (`texnikum-jadval`)

- **Texnologiyalar:** React Native 0.88, Expo SDK 58, TypeScript, React Navigation (Native Stack + Bottom Tabs), `@react-native-async-storage/async-storage`, `expo-haptics`, `expo-linear-gradient`.
- **Dizayn Tizimi:** 3D Neumorphic Sculpted Light / Dark mavzusi, taktil sezgilar (Haptic feedback), silliq animatsiyalar.
- **Asosiy Imkoniyatlar:**
  1. **Kirish (StudentLoginScreen):** 14 xonali JSHSHIR bilan kirish, format tekshiruvi, sinov ma'lumotlarisiz toza interfeys.
  2. **Bugungi Jadval (TodayScheduleTab):**
     - Jonli vaqt hisobi: Ayni paytda qaysi dars ketayotgani, dars tugashiga qancha vaqt qolgani va dars progress-bari.
     - **Jonli Eslatma (Notification):** Navbatdagi darsga 15 daqiqa yoki kam vaqt qolganda ekranda diqqatni tortuvchi eslatma (`🔔 Darsga 10 daqiqa qoldi`).
     - **Ulashish (Share):** Bugungi dars jadvalini Telegram/WhatsApp guruhlarga bitta tugma bilan jo'natish.
  3. **Haftalik Jadval (WeeklyScheduleTab):** Dushanbadan Shanbagacha kunlarni ko'rish va haftalik jadvalni ulashish.
  4. **Qo'ng'iroqlar Jadvali (BellsScheduleModal):** 1-paradan 5-paragacha vaqtlar, tanaffuslar va katta tushlik (13:00 – 13:40) jadvali; faol oraliq jonli ajratib ko'rsatiladi.
  5. **Oflayn Kesh & Xavfsiz Chiqish:**
     - Internet uzilib qolsa, oxirgi yuklangan jadval `AsyncStorage` dan ochiladi.
     - Agar admin vebda talabaning guruhini o'chirsa, mobil ilova buni snapshot orqali darhol payqab, chiroyli ogohlantirish bilan foydalanuvchini tizimdan chiqaradi.

### Ishga tushirish:
```powershell
cd texnikum-jadval
npx expo start           # QR kod orqali Expo Go
npx expo start --tunnel  # Masofadan sinash
```

---

## 6. Mustaqil Android .APK Chiqarish (EAS Build)

Ilovani Play Marketga kirmasdan, mustaqil `.apk` fayl sifatida har qanday telefonga o'rnatish:

- `app.json`: Paket nomi `uz.texnikum.jadval`, versiya `1.0.0`, orientatsiya `portrait`.
- `eas.json`: `preview` profilida `android.buildType: "apk"` belgilangan va barcha Firebase kalitlari kiritilgan.

### APK Yig'ish Buyruqlari:
```powershell
cd texnikum-jadval
npx.cmd eas-cli login                              # Expo hisobiga kirish
npx.cmd eas-cli build -p android --profile preview # Bulutda APK yaratish
```
*(Natija: Expo Cloud 5-8 daqiqada tayyor `.apk` yuklab olish havolasi va QR kod taqdim etadi).*

---

## 7. Rasmiy Brending va Aloqa Standartlari

- **Muassasa rasmiy nomi:** `Sirdaryo ilg'or kasbiy mahorat texnikumi` (qisqartma: `Sirdaryo IKMT`)
- **Dasturchi guruhi:** `Blitz Soft group`
- **Aloqa qoidasi:** Foydalanuvchi interfeysida shaxsiy telefon yoki shaxsiy elektron pochta ko'rsatilmaydi; barcha ekranlarda yagona rasmiy `Dasturchi: Blitz Soft group` brendi saqlanadi.
- **Til standarti:** Ikkala mijoz (Web Admin va Mobil Ilova) to'liq **100% sof o'zbek tilida** ishlaydi.

---

## 8. Dasturchi va Agentlar Uchun Buyruqlar Cheatsheet

| Vazifa | Buyruq | Izoh |
| :--- | :--- | :--- |
| **Mobil Typecheck** | `cd texnikum-jadval && npx.cmd tsc --noEmit` | Turlarni tekshirish (0 xato) |
| **Mobil Mantiqiy Testlar** | `cd texnikum-jadval && node scripts/test-logic.js` | 6 ta test to'plami |
| **Mobil Android Export** | `cd texnikum-jadval && npx.cmd expo export --platform android` | Hermes baytkod tekshiruvi |
| **Web Admin Build** | `cd admin-web && npm.cmd run build` | Vite ishlab chiqarish yig'ilishi |
| **Git Push** | `git push origin main` | Kodlarni GitHub'ga yuklash |
| **APK Build** | `cd texnikum-jadval && npx.cmd eas-cli build -p android --profile preview` | Mustaqil APK yig'ish |
