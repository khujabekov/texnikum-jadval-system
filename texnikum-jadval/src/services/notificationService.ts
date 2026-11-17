import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lesson } from '../types';
import { parseTimeRange } from '../utils/time';

const NOTIFICATIONS_KEY = 'texnikum_lesson_notifications_v1';

class NotificationService {
  /**
   * Bildirishnomalar yoqilgan yoki o'chirilganligini tekshiradi
   */
  async isEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Bildirishnomalarni yoqish / o'chirish
   */
  async setEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, enabled ? 'true' : 'false');
    } catch (e) {
      console.warn('[NotificationService] Error saving setting', e);
    }
  }

  /**
   * Keyingi darsgacha qancha vaqt qolganligini aniqlaydi (10 daqiqa oldin eslatish uchun)
   */
  getNextLessonReminder(lessons: Lesson[], currentMinutes: number): {
    lesson: Lesson;
    minutesUntilLesson: number;
    shouldNotify: boolean;
  } | null {
    for (const les of lessons) {
      const parsed = parseTimeRange(les.timeRange);
      if (!parsed) continue;

      const diff = parsed.startMin - currentMinutes;
      // Darsga 1 dan 15 daqiqagacha vaqt qolganda
      if (diff > 0 && diff <= 15) {
        return {
          lesson: les,
          minutesUntilLesson: diff,
          shouldNotify: true,
        };
      }
    }
    return null;
  }
}

export const notificationService = new NotificationService();
