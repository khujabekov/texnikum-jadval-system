import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { Group, Lesson, StudentRecord, Weekday } from '../types';
import type { ScheduleDoc, StudentDoc, GroupDoc } from '../types/schema';
import { dayNumberToWeekday } from '../types/schema';
import { INITIAL_GROUPS, INITIAL_LESSONS, INITIAL_STUDENTS } from './seedData';
import { firestore, isFirebaseReady } from './firebaseConfig';

const STORAGE_KEYS = {
  GROUPS: '@texnikum_groups_v2',
  LESSONS: '@texnikum_lessons_v2',
  STUDENTS: '@texnikum_students_v2',
  STUDENT_SESSION: '@texnikum_student_session_v2',
  INITIALIZED: '@texnikum_db_initialized_v2',
};

class StorageService {
  /**
   * Initializes local database with seed data for instant Expo Go fallback
   */
  async init(): Promise<void> {
    try {
      const isInit = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInit) {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS)],
          [STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS)],
          [STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS)],
          [STORAGE_KEYS.INITIALIZED, 'true'],
        ]);
      }
    } catch {
      // Safe fallback if AsyncStorage encounters an issue
    }
  }

  // --- GROUPS (Read-Only) ---
  async getGroups(): Promise<Group[]> {
    try {
      await this.init();
      // If Firestore is ready, try to refresh groups in background
      if (isFirebaseReady && firestore) {
        try {
          const snap = await getDocs(collection(firestore, 'groups'));
          if (!snap.empty) {
            const list: Group[] = [];
            snap.forEach((d) => {
              const data = d.data();
              list.push({
                id: d.id,
                name: data.name || 'Guruh',
                department: data.department || 'Axborot texnologiyalari',
                courseYear: data.courseYear || 1,
              });
            });
            await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(list));
            return list;
          }
        } catch {
          // Continue to local cache
        }
      }

      const raw = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!raw) return INITIAL_GROUPS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  }

  // --- STUDENTS & LOGIN (O(1) Instant Read) ---
  async findStudentByJshshir(
    jshshir: string
  ): Promise<{ student: StudentRecord; group: Group } | null> {
    const cleanJsh = jshshir.trim();

    // 1. Instant O(1) read from Firestore: `students/{jshshir}`
    if (isFirebaseReady && firestore) {
      try {
        const studentDocRef = doc(firestore, 'students', cleanJsh);
        const studentSnap = await getDoc(studentDocRef);

        if (studentSnap.exists()) {
          const sData = studentSnap.data() as StudentDoc;
          let groupObj: Group = {
            id: sData.groupId,
            name: sData.groupName || 'Guruh',
            department: 'Axborot texnologiyalari',
            courseYear: 1,
          };

          // Try fetching group metadata
          try {
            const grpSnap = await getDoc(doc(firestore, 'groups', sData.groupId));
            if (grpSnap.exists()) {
              const gData = grpSnap.data();
              groupObj = {
                id: grpSnap.id,
                name: gData.name || sData.groupName || 'Guruh',
                department: gData.department || 'Axborot texnologiyalari',
                courseYear: gData.courseYear || 1,
              };
            }
          } catch {}

          const studentRecord: StudentRecord = {
            jshshir: cleanJsh,
            groupId: sData.groupId,
            fullName: sData.fullName,
            addedAt: sData.updatedAt ? String(sData.updatedAt) : new Date().toISOString(),
          };

          return { student: studentRecord, group: groupObj };
        }
      } catch (e) {
        console.warn('[StorageService] Firestore student lookup error, falling back to local cache', e);
      }
    }

    // 2. Offline / Local fallback
    try {
      await this.init();
      const rawStudents = await AsyncStorage.getItem(STORAGE_KEYS.STUDENTS);
      const allStudents: StudentRecord[] = rawStudents ? JSON.parse(rawStudents) : INITIAL_STUDENTS;
      const found = allStudents.find((s) => s.jshshir === cleanJsh);

      if (found) {
        const groups = await this.getGroups();
        const group = groups.find((g) => g.id === found.groupId) || {
          id: found.groupId,
          name: 'Guruh',
          department: 'Axborot texnologiyalari',
          courseYear: 1,
        };
        return { student: found, group };
      }
    } catch {
      return null;
    }

    return null;
  }

  // --- REAL-TIME SCHEDULE SUBSCRIPTION (`onSnapshot`) ---
  /**
   * Subscribes to real-time schedule updates for a group.
   * Any change made by the Admin on the Web Panel is immediately delivered here.
   */
  subscribeToGroupSchedule(
    groupId: string,
    onUpdate: (lessons: Lesson[]) => void
  ): Unsubscribe {
    // 1. Immediately emit cached lessons from AsyncStorage for zero-latency UI
    this.getLessons(groupId).then((cached) => {
      if (cached.length > 0) {
        onUpdate(cached);
      }
    });

    if (!isFirebaseReady || !firestore) {
      // Local fallback: return no-op unsubscribe
      return () => {};
    }

    try {
      const q = query(collection(firestore, 'schedules'), where('groupId', '==', groupId));
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (snapshot.empty) {
            // Keep local cache or empty
            return;
          }

          const freshLessons: Lesson[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as ScheduleDoc;
            const dayName = dayNumberToWeekday(data.dayOfWeek);
            if (Array.isArray(data.lessons)) {
              for (const item of data.lessons) {
                freshLessons.push({
                  id: item.id || `les_${groupId}_${data.dayOfWeek}_${item.paraNumber}`,
                  groupId,
                  day: dayName,
                  pairNumber: item.paraNumber || (item as any).pairNumber || 1,
                  timeRange: item.timeRange,
                  subjectName: item.subjectName,
                  teacherName: item.teacherName,
                  roomNumber: item.roomNumber,
                  type: item.type as any,
                });
              }
            }
          });

          freshLessons.sort((a, b) => a.pairNumber - b.pairNumber);

          // Update offline cache
          await AsyncStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(freshLessons));
          onUpdate(freshLessons);
        },
        (error) => {
          console.warn('[StorageService] Real-time schedule listener error', error);
        }
      );

      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  // --- REAL-TIME STUDENT DELETION & AUTO-LOGOUT DETECTION ---
  /**
   * Subscribes to the student's personal record.
   * If the Admin deletes this student or group on the Web Panel,
   * snapshot.exists() becomes false, triggering immediate graceful logout.
   */
  subscribeToStudentStatus(
    jshshir: string,
    onDeleted: () => void
  ): Unsubscribe {
    if (!isFirebaseReady || !firestore) {
      return () => {};
    }

    try {
      const unsubscribe = onSnapshot(
        doc(firestore, 'students', jshshir),
        (snapshot) => {
          if (!snapshot.exists()) {
            onDeleted();
          }
        },
        (error) => {
          console.warn('[StorageService] Real-time student status listener error', error);
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  // --- LESSONS QUERY (Offline-Ready) ---
  async getLessons(groupId?: string, day?: Weekday): Promise<Lesson[]> {
    try {
      await this.init();
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.LESSONS);
      let lessons: Lesson[] = raw ? JSON.parse(raw) : INITIAL_LESSONS;

      if (groupId) {
        lessons = lessons.filter((l) => l.groupId === groupId);
      }
      if (day) {
        lessons = lessons.filter((l) => l.day === day);
      }

      lessons.sort((a, b) => a.pairNumber - b.pairNumber);
      return lessons;
    } catch {
      return INITIAL_LESSONS;
    }
  }

  // --- SESSIONS ---
  async saveStudentSession(jshshir: string, group: Group): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STUDENT_SESSION,
        JSON.stringify({ jshshir, group })
      );
    } catch {}
  }

  async getStudentSession(): Promise<{ jshshir: string; group: Group } | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.jshshir && parsed.group && parsed.group.id) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
    } catch {}
  }
}

export const storageService = new StorageService();
