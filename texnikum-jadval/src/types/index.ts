export * from './schema';

export type Weekday =
  | 'Dushanba'
  | 'Seshanba'
  | 'Chorshanba'
  | 'Payshanba'
  | 'Juma'
  | 'Shanba'
  | 'Yakshanba';

export interface DayOption {
  key: Weekday;
  shortLabel: string;
  fullLabel: string;
}

export const WEEKDAYS: DayOption[] = [
  { key: 'Dushanba', shortLabel: 'Dush', fullLabel: 'Dushanba' },
  { key: 'Seshanba', shortLabel: 'Sesh', fullLabel: 'Seshanba' },
  { key: 'Chorshanba', shortLabel: 'Chor', fullLabel: 'Chorshanba' },
  { key: 'Payshanba', shortLabel: 'Pay', fullLabel: 'Payshanba' },
  { key: 'Juma', shortLabel: 'Jum', fullLabel: 'Juma' },
  { key: 'Shanba', shortLabel: 'Shan', fullLabel: 'Shanba' },
];

export interface Lesson {
  id: string;
  groupId: string;
  day: Weekday;
  pairNumber: number; // 1, 2, 3, 4, 5, 6
  paraNumber?: number; // Alias matching Firestore schema
  timeRange: string;  // Masalan: "08:30 - 09:50"
  subjectName: string; // Masalan: "Web dasturlash"
  teacherName: string; // Masalan: "Dots. Karimov Sh.A."
  roomNumber: string;  // Masalan: "302-xona"
  type?: 'Ma\'ruza' | 'Amaliyot' | 'Laboratoriya';
}

export interface Group {
  id: string;
  name: string;        // Masalan: "21-24 AT guruhi"
  department: string;  // Masalan: "Axborot texnologiyalari"
  courseYear: number;  // 1, 2, 3, 4
}

export interface StudentRecord {
  jshshir: string;     // 14 ta raqam
  groupId: string;
  fullName?: string;
  addedAt: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  mode: ThemeMode;
  base: string;
  lightShadow: string;
  darkShadow: string;
  primaryText: string;
  secondaryText: string;
  accent: string;
  accentGradient: [string, string];
  accentLight: string;
  insetGradient: [string, string];
  cardHighlightBorder: string;
  insetBorder: string;
  danger: string;
  success: string;
  warning: string;
  badgeBg: string;
  surfaceGradient: [string, string];
  specularHighlight: string;
  shadowEdge: string;
  glowAccent: string;
  timelineRail: string;
}

export interface ActiveSession {
  type: 'student' | 'admin';
  jshshir?: string;
  group?: Group;
  username?: string;
}
