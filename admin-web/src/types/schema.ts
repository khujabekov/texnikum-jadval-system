export type Weekday =
  | 'Dushanba'
  | 'Seshanba'
  | 'Chorshanba'
  | 'Payshanba'
  | 'Juma'
  | 'Shanba'
  | 'Yakshanba';

export const WEEKDAYS_MAP: Record<number, Weekday> = {
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
  7: 'Yakshanba',
};

export const WEEKDAY_TO_NUM: Record<Weekday, number> = {
  Dushanba: 1,
  Seshanba: 2,
  Chorshanba: 3,
  Payshanba: 4,
  Juma: 5,
  Shanba: 6,
  Yakshanba: 7,
};

export interface GroupDoc {
  id: string;
  name: string; // e.g. "21-24 AT guruhi"
  department: string; // e.g. "Axborot texnologiyalari"
  courseYear: number; // 1, 2, 3, 4
  createdAt?: any;
}

export interface StudentDoc {
  jshshir: string; // 14-digit JSHSHIR, also the document ID in 'students'
  groupId: string;
  groupName?: string;
  fullName?: string;
  enrolledAt?: string;
  addedAt?: string;
  updatedAt?: any;
}

export interface LessonItem {
  id: string;
  paraNumber: number; // 1, 2, 3, 4, 5, 6
  pairNumber?: number; // Alias for backward compatibility
  timeRange: string; // e.g. "08:30 - 09:50"
  subjectName: string; // e.g. "Web dasturlash"
  teacherName: string; // e.g. "Dots. Karimov Sh.A."
  roomNumber: string; // e.g. "302-auditoriya"
  type?: string;
  groupId?: string;
  day?: Weekday;
}

export interface ScheduleDoc {
  groupId: string;
  dayOfWeek: number; // 1-6 (1=Dushanba, ..., 6=Shanba)
  lessons: LessonItem[];
  updatedAt?: any;
}

export interface BulkImportReport {
  added: number;
  skippedAlreadyInDb: number;
  duplicatesInInput: number;
  invalidFormat: number;
  totalFound: number;
}

export function weekdayToDayNumber(day: Weekday): number {
  return WEEKDAY_TO_NUM[day] || 1;
}

export function dayNumberToWeekday(num: number): Weekday {
  return WEEKDAYS_MAP[num] || 'Dushanba';
}
