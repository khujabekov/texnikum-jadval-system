# 🎓 Texnikum Dars Jadvali — Neumorphic Mobile App (Expo SDK 58 & TypeScript)

Kasb-hunar ta'limi (Texnikum) o'quvchilari va ma'muriyati uchun maxsus ishlab chiqilgan zamonaviy, to'liq **Neumorphism (Soft UI)** uslubidagi mobil ilova. Loyiha **100% Expo Go** moslashuvchanligiga ega bo'lib, hech qanday qo'shimcha native modullar talab qilmaydi.

---

## 📱 Asosiy Imkoniyatlar

### 1. 🎨 Neumorphism (Soft UI) Dizayn Tizimi
- **Light & Dark Mode:** Boshqaruv panelida animatsiyali rejim o'zgartirgich (Sun/Moon switch).
- **Qavariq (Extruded/Convex) Kartalar va Tugmalar:** Ikkita qatlamli `<View>` orqali pastki-o'ng qora soya (`#A3B1C6` / `#15181B`) va yuqori-chap yorug'lik nurlanishi (`#FFFFFF` / `#2C3136`) hamda 1px nozik chegara bilan chizilgan.
- **Botiq (Concave/Inset) Kiritish Maydonlari:** `LinearGradient` gradienti orqali botiq effekt berilgan inputlar va tanlangan kun tabletkalari.
- **Taktil Fikr-mulohaza (Tactile Haptic Feedback):** Tugmalar bosilganda silliq `Animated` o'lcham o'zgarishi (`0.97`).

### 2. 🔐 Autentifikatsiya va Talaba Kirishi
- **Talaba Kirishi (Standart oyna):**
  - 14 xonali JSHSHIR raqami kiritiladi (`keyboardType="number-pad"`).
  - O'zbek tilidagi to'liq validatsiya (*"JSHSHIR 14 ta raqamdan iborat bo'lishi kerak"*, *"Ushbu JSHSHIR bazada topilmadi"*).
  - Tizimga kirish holati `AsyncStorage`da xavfsiz saqlanadi.
- **Ma'muriyat Kirishi:**
  - Login ekranining yuqori o'ng burchagidagi qulf belgisi orqali ochiladi.
  - Standart ma'lumotlar: **Login:** `admin` | **Parol:** `admin123`.

### 3. 📚 Talaba Interfeysi
- **Yuqori sarlavha:** Guruh nomi (masalan: *"21-24 AT guruhi"*), yo'nalish nomi, shaxsiy JSHSHIR belgisi, Mavzu o'zgartirgich va Tizimdan chiqish tugmasi.
- **1-ilova: Bugungi dars jadvali (Today's Schedule):**
  - Joriy haftaning kunini avtomatik aniqlaydi (`Dushanba` – `Shanba`).
  - Yakshanba kuni yoqimli hordiq kartasini ko'rsatadi (*"Bugun dam olish kuni"*).
- **2-ilova: Haftalik dars jadvali (Weekly Schedule):**
  - Gorizontal Neumorphic kun tanlash tabletkalari (`Dush`, `Sesh`, `Chor`, `Pay`, `Jum`, `Shan`).
  - Faol kun botiq (inset) effektida ko'rinadi.
- **Dars kartasi maydonlari:**
  - `Para raqami va vaqti` (masalan: `1-para • 08:30 - 09:50`)
  - `Fan nomi` (qalin, o'qilishi oson shrift)
  - `O'qituvchi F.I.Sh.` (belgi bilan)
  - `Xona raqami` (masalan: `302-auditoriya` yoki `Laboratoriya 4`)

### 4. ⚡ Quvvatli Ma'muriyat Paneli (Admin Dashboard)
1. **Guruhlar (Groups):**
   - Guruh qo'shish, tahrirlash va o'chirish.
   - Guruh bo'yicha talabalar soni va darslar soni statistikasi.
2. **Dars jadvali muharriri va Tezkor nusxalash (Schedule Editor & Quick Copy):**
   - Guruh va kunni tanlab, darslarni qo'shish, tahrirlash va o'chirish.
   - Standart vaqt shablonlari (`08:30 - 09:50`, `10:00 - 11:20`, `11:50 - 13:10`, ...).
   - **Jadvalni nusxalash:** 2 ta bosish bilan tanlangan kun yoki butun haftalik dars jadvalini boshqa guruhga tezkor ko'chirish.
3. **O'quvchilar JSHSHIR (Single & Bulk Assignment):**
   - **Yakka qo'shish:** 14 xonali JSHSHIR kiritish va guruhga biriktirish.
   - **Ro'yxat orqali yuklash (Bulk Import):** Yangi qator, vergul yoki bo'sh joy bilan ajratilgan o'nlab JSHSHIR raqamlarini birdaniga joylashtirish. Dublikatlar avtomatik tozalanadi va O'zbek tilida hisobot beriladi (*"25 ta JSHSHIR muvaffaqiyatli biriktirildi"*).

---

## 🔑 Sinov Ma'lumotlari (Pre-loaded Seed Data)

Ilova o'rnatilishi bilanoq darhol to'liq ishlaydigan namunaviy ma'lumotlar bilan yuklanadi:

| Foydalanuvchi | Identifikator / Login | Parol | Guruh |
|---|---|---|---|
| **Talaba 1** | `12345678901234` | - | 21-24 AT guruhi |
| **Talaba 2** | `98765432109876` | - | 11-25 DT guruhi |
| **Ma'mur (Admin)** | `admin` | `admin123` | Barcha guruhlar |

---

## 🚀 Ishga Tushirish (Expo Go)

```bash
# 1. Loyiha papkasiga o'tish
cd texnikum-jadval

# 2. Serverni ishga tushirish
npm start
```

Telefoningizdagi **Expo Go** ilovasi orqali terminalda hosil bo'lgan QR kodni skaner qiling.
Ilova darhol qurilmangizda ochiladi!
