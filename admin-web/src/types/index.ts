export * from './schema';
import type { GroupDoc, LessonItem, StudentDoc, Weekday } from './schema';

export type Group = GroupDoc;

export type Lesson = LessonItem & {
  groupId: string;
  day: Weekday;
};

export type StudentRecord = StudentDoc;

export const WEEKDAYS: { key: Weekday; label: string; shortLabel: string }[] = [
  { key: 'Dushanba', label: 'Dushanba', shortLabel: 'Dush' },
  { key: 'Seshanba', label: 'Seshanba', shortLabel: 'Sesh' },
  { key: 'Chorshanba', label: 'Chorshanba', shortLabel: 'Chor' },
  { key: 'Payshanba', label: 'Payshanba', shortLabel: 'Pay' },
  { key: 'Juma', label: 'Juma', shortLabel: 'Jum' },
  { key: 'Shanba', label: 'Shanba', shortLabel: 'Shan' },
];
