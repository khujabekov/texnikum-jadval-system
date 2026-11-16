import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import type {
  GroupDoc,
  StudentDoc,
  ScheduleDoc,
  LessonItem,
  Weekday,
  BulkImportReport,
} from '../types/schema';
import type { Lesson } from '../types';
import { weekdayToDayNumber, dayNumberToWeekday } from '../types/schema';
import { INITIAL_GROUPS, INITIAL_LESSONS, INITIAL_STUDENTS } from '../seedData';
import { firestore, auth, isFirebaseReady } from '../firebase';

const LOCAL_STORAGE_KEYS = {
  GROUPS: 'texnikum_admin_groups_v2',
  SCHEDULES: 'texnikum_admin_schedules_v2',
  STUDENTS: 'texnikum_admin_students_v2',
  AUTH: 'texnikum_admin_auth_v2',
};

class AdminService {
  private initialized = false;

  private initLocal(): void {
    if (this.initialized) return;

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    }

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS)) {
      const studentDocs: StudentDoc[] = INITIAL_STUDENTS.map((s) => ({
        jshshir: s.jshshir,
        groupId: s.groupId,
        groupName: INITIAL_GROUPS.find((g) => g.id === s.groupId)?.name || 'Guruh',
        fullName: s.fullName,
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(studentDocs));
    }

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SCHEDULES)) {
      // Build schedules from INITIAL_LESSONS: group by groupId and dayOfWeek
      const scheduleMap: Record<string, ScheduleDoc> = {};
      for (const les of INITIAL_LESSONS) {
        const dayNum = weekdayToDayNumber(les.day);
        const schedId = `${les.groupId}_${dayNum}`;
        if (!scheduleMap[schedId]) {
          scheduleMap[schedId] = {
            groupId: les.groupId,
            dayOfWeek: dayNum,
            lessons: [],
            updatedAt: new Date().toISOString(),
          };
        }
        scheduleMap[schedId].lessons.push({
          id: les.id,
          paraNumber: les.paraNumber || (les as any).pairNumber || 1,
          timeRange: les.timeRange,
          subjectName: les.subjectName,
          teacherName: les.teacherName,
          roomNumber: les.roomNumber,
        });
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(Object.values(scheduleMap)));
    }

    this.initialized = true;
  }

  // --- AUTHENTICATION ---
  isAuthenticated(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true';
  }

  async login(passwordOrEmail: string, optionalPassword?: string): Promise<boolean> {
    const password = optionalPassword !== undefined ? optionalPassword : passwordOrEmail;
    const email = optionalPassword !== undefined ? passwordOrEmail : 'admin@texnikum.uz';

    // 1. Try Firebase Auth if available
    if (isFirebaseReady && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
        return true;
      } catch {
        // Fall back to local check if Firebase project not yet seeded with auth account
      }
    }

    // 2. Local Fallback Auth (admin / admin123)
    if (password === 'admin123' || password === 'admin') {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    if (isFirebaseReady && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH);
  }

  onAuthChanged(callback: (user: User | null) => void): () => void {
    if (isFirebaseReady && auth) {
      return onAuthStateChanged(auth, callback);
    }
    return () => {};
  }

  // --- GROUPS (`groups/{groupId}`) ---
  async getGroups(): Promise<GroupDoc[]> {
    this.initLocal();

    if (isFirebaseReady && firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'groups'));
        if (!snap.empty) {
          const list: GroupDoc[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...d.data() } as GroupDoc));
          localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(list));
          return list;
        }
      } catch (e) {
        console.warn('[AdminService] Firestore read failed, using local cache', e);
      }
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.GROUPS);
    return raw ? JSON.parse(raw) : INITIAL_GROUPS;
  }

  async saveGroup(group: GroupDoc): Promise<void> {
    const groups = await this.getGroups();
    const existingIndex = groups.findIndex((g) => g.id === group.id);
    const docData: GroupDoc = {
      ...group,
      createdAt: group.createdAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      groups[existingIndex] = { ...groups[existingIndex], ...docData };
    } else {
      groups.push(docData);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(groups));

    // Firestore Write
    if (isFirebaseReady && firestore) {
      try {
        await setDoc(doc(firestore, 'groups', group.id), {
          ...docData,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('[AdminService] Error saving group to Firestore', e);
      }
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    const groups = await this.getGroups();
    const filtered = groups.filter((g) => g.id !== groupId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(filtered));

    // Delete associated schedules (1-6)
    const schedules = await this.getAllSchedules();
    const remainingSchedules = schedules.filter((s) => s.groupId !== groupId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(remainingSchedules));

    // Delete associated students
    const students = await this.getStudents();
    const remainingStudents = students.filter((s) => s.groupId !== groupId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(remainingStudents));

    // Firestore Cascading Deletion
    if (isFirebaseReady && firestore) {
      try {
        const batch = writeBatch(firestore);
        batch.delete(doc(firestore, 'groups', groupId));

        // Delete schedule documents for this group (days 1-6)
        for (let day = 1; day <= 6; day++) {
          batch.delete(doc(firestore, 'schedules', `${groupId}_${day}`));
        }

        // Delete student documents in this group
        const targetStudents = students.filter((s) => s.groupId === groupId);
        for (const st of targetStudents) {
          batch.delete(doc(firestore, 'students', st.jshshir));
        }

        await batch.commit();
      } catch (e) {
        console.error('[AdminService] Error deleting group from Firestore', e);
      }
    }
  }

  async getLessons(groupId?: string, day?: Weekday): Promise<Lesson[]> {
    const schedules = await this.getAllSchedules();
    const result: Lesson[] = [];
    for (const s of schedules) {
      if (groupId && s.groupId !== groupId) continue;
      const sDay = dayNumberToWeekday(s.dayOfWeek);
      if (day && sDay !== day) continue;
      for (const l of s.lessons) {
        result.push({
          ...l,
          groupId: s.groupId,
          day: sDay,
          pairNumber: l.paraNumber,
        });
      }
    }
    return result;
  }

  async saveLesson(lesson: LessonItem & { groupId: string; day: Weekday }): Promise<void> {
    await this.saveLessonToSchedule(lesson.groupId, lesson.day, lesson);
  }

  async deleteLesson(lessonId: string, groupId?: string, day?: Weekday): Promise<void> {
    if (groupId && day) {
      await this.deleteLessonFromSchedule(groupId, day, lessonId);
      return;
    }
    const schedules = await this.getAllSchedules();
    for (const s of schedules) {
      const found = s.lessons.find((l) => l.id === lessonId);
      if (found) {
        await this.deleteLessonFromSchedule(s.groupId, dayNumberToWeekday(s.dayOfWeek), lessonId);
        break;
      }
    }
  }

  // --- SCHEDULES (`schedules/{groupId}_{dayOfWeek}`) ---
  private async getAllSchedules(): Promise<ScheduleDoc[]> {
    this.initLocal();
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SCHEDULES);
    return raw ? JSON.parse(raw) : [];
  }

  async getSchedule(groupId: string, dayOfWeek: number): Promise<ScheduleDoc> {
    this.initLocal();
    const docId = `${groupId}_${dayOfWeek}`;

    if (isFirebaseReady && firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'schedules', docId));
        if (snap.exists()) {
          const data = snap.data() as ScheduleDoc;
          return {
            groupId: data.groupId || groupId,
            dayOfWeek: data.dayOfWeek || dayOfWeek,
            lessons: data.lessons || [],
            updatedAt: data.updatedAt,
          };
        }
      } catch (e) {
        console.warn('[AdminService] Firestore schedule get failed, falling back to local', e);
      }
    }

    const all = await this.getAllSchedules();
    const found = all.find((s) => s.groupId === groupId && s.dayOfWeek === dayOfWeek);
    return (
      found || {
        groupId,
        dayOfWeek,
        lessons: [],
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async saveLessonToSchedule(
    groupId: string,
    day: Weekday,
    lesson: LessonItem
  ): Promise<void> {
    const dayNum = weekdayToDayNumber(day);
    const schedule = await this.getSchedule(groupId, dayNum);

    // Duplicate pair validation
    const duplicate = schedule.lessons.find(
      (l) => l.paraNumber === lesson.paraNumber && l.id !== lesson.id
    );
    if (duplicate) {
      throw new Error(
        `Ushbu kunda ${lesson.paraNumber}-para allaqachon mavjud ("${duplicate.subjectName}"). Boshqa para raqamini tanlang.`
      );
    }

    const lessonItem: LessonItem = {
      ...lesson,
      id: lesson.id || `les_${groupId}_${dayNum}_${Date.now()}`,
    };

    const existingIdx = schedule.lessons.findIndex((l) => l.id === lessonItem.id);
    if (existingIdx >= 0) {
      schedule.lessons[existingIdx] = lessonItem;
    } else {
      schedule.lessons.push(lessonItem);
    }

    schedule.lessons.sort((a, b) => a.paraNumber - b.paraNumber);
    schedule.updatedAt = new Date().toISOString();

    // Update local cache
    const all = await this.getAllSchedules();
    const schedIdx = all.findIndex((s) => s.groupId === groupId && s.dayOfWeek === dayNum);
    if (schedIdx >= 0) {
      all[schedIdx] = schedule;
    } else {
      all.push(schedule);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(all));

    // Write to Firestore: `schedules/{groupId}_{dayOfWeek}`
    if (isFirebaseReady && firestore) {
      try {
        const docId = `${groupId}_${dayNum}`;
        await setDoc(doc(firestore, 'schedules', docId), {
          groupId,
          dayOfWeek: dayNum,
          lessons: schedule.lessons,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('[AdminService] Error saving schedule to Firestore', e);
      }
    }
  }

  async deleteLessonFromSchedule(
    groupId: string,
    day: Weekday,
    lessonId: string
  ): Promise<void> {
    const dayNum = weekdayToDayNumber(day);
    const schedule = await this.getSchedule(groupId, dayNum);

    schedule.lessons = schedule.lessons.filter((l) => l.id !== lessonId);
    schedule.updatedAt = new Date().toISOString();

    const all = await this.getAllSchedules();
    const schedIdx = all.findIndex((s) => s.groupId === groupId && s.dayOfWeek === dayNum);
    if (schedIdx >= 0) {
      all[schedIdx] = schedule;
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(all));

    if (isFirebaseReady && firestore) {
      try {
        const docId = `${groupId}_${dayNum}`;
        await setDoc(doc(firestore, 'schedules', docId), {
          groupId,
          dayOfWeek: dayNum,
          lessons: schedule.lessons,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('[AdminService] Error deleting lesson from Firestore schedule', e);
      }
    }
  }

  async copySchedule(
    sourceGroupId: string,
    targetGroupId: string,
    dayOnly?: Weekday
  ): Promise<number> {
    if (sourceGroupId === targetGroupId) {
      throw new Error('Bir xil guruhga nusxalab bo\'lmaydi');
    }

    const daysToCopy: number[] = dayOnly ? [weekdayToDayNumber(dayOnly)] : [1, 2, 3, 4, 5, 6];
    let totalLessonsCopied = 0;
    const all = await this.getAllSchedules();

    const firestoreBatch = isFirebaseReady && firestore ? writeBatch(firestore) : null;

    for (const dayNum of daysToCopy) {
      const sourceSched = await this.getSchedule(sourceGroupId, dayNum);
      if (sourceSched.lessons.length === 0) continue;

      const copiedLessons: LessonItem[] = sourceSched.lessons.map((l, i) => ({
        ...l,
        id: `les_${targetGroupId}_${dayNum}_${Date.now()}_${i}`,
      }));

      totalLessonsCopied += copiedLessons.length;

      const newSched: ScheduleDoc = {
        groupId: targetGroupId,
        dayOfWeek: dayNum,
        lessons: copiedLessons,
        updatedAt: new Date().toISOString(),
      };

      const existingIdx = all.findIndex(
        (s) => s.groupId === targetGroupId && s.dayOfWeek === dayNum
      );
      if (existingIdx >= 0) {
        all[existingIdx] = newSched;
      } else {
        all.push(newSched);
      }

      if (firestoreBatch && firestore) {
        const docId = `${targetGroupId}_${dayNum}`;
        firestoreBatch.set(doc(firestore, 'schedules', docId), {
          groupId: targetGroupId,
          dayOfWeek: dayNum,
          lessons: copiedLessons,
          updatedAt: serverTimestamp(),
        });
      }
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(all));

    if (firestoreBatch) {
      try {
        await firestoreBatch.commit();
      } catch (e) {
        console.error('[AdminService] Error committing copy schedule batch', e);
      }
    }

    return totalLessonsCopied;
  }

  // --- STUDENTS (`students/{jshshir}`) ---
  async getStudents(groupId?: string): Promise<StudentDoc[]> {
    this.initLocal();

    if (isFirebaseReady && firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'students'));
        if (!snap.empty) {
          const list: StudentDoc[] = [];
          snap.forEach((d) => list.push({ jshshir: d.id, ...d.data() } as StudentDoc));
          localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(list));
          if (groupId) {
            return list.filter((s) => s.groupId === groupId);
          }
          return list;
        }
      } catch (e) {
        console.warn('[AdminService] Firestore students get failed, using local cache', e);
      }
    }

    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
    let students: StudentDoc[] = raw ? JSON.parse(raw) : [];
    if (groupId) {
      students = students.filter((s) => s.groupId === groupId);
    }
    return students;
  }

  async addStudent(student: StudentDoc): Promise<void> {
    const students = await this.getStudents();
    const existingIndex = students.findIndex((s) => s.jshshir === student.jshshir);
    const docData: StudentDoc = {
      ...student,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...docData };
    } else {
      students.push(docData);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    // Write to Firestore: document ID is strictly student's JSHSHIR
    if (isFirebaseReady && firestore) {
      try {
        await setDoc(doc(firestore, 'students', student.jshshir), {
          ...docData,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('[AdminService] Error saving student to Firestore', e);
      }
    }
  }

  async deleteStudent(jshshir: string): Promise<void> {
    const students = await this.getStudents();
    const filtered = students.filter((s) => s.jshshir !== jshshir);
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));

    if (isFirebaseReady && firestore) {
      try {
        await deleteDoc(doc(firestore, 'students', jshshir));
      } catch (e) {
        console.error('[AdminService] Error deleting student from Firestore', e);
      }
    }
  }

  /**
   * Bulk Import Students with Firestore Batch Writes (chunked in 450 items per batch)
   */
  async bulkImportStudents(text: string, groupId: string): Promise<BulkImportReport> {
    const groups = await this.getGroups();
    const group = groups.find((g) => g.id === groupId);
    const groupName = group ? group.name : 'Guruh';

    const tokens = text
      .split(/[\r\n,;\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const validList: string[] = [];
    let invalidCount = 0;

    for (const token of tokens) {
      if (/^\d{14}$/.test(token)) {
        validList.push(token);
      } else {
        invalidCount++;
      }
    }

    const uniqueSet = new Set<string>();
    let duplicateInInput = 0;
    for (const item of validList) {
      if (uniqueSet.has(item)) {
        duplicateInInput++;
      } else {
        uniqueSet.add(item);
      }
    }

    const currentStudents = await this.getStudents();
    const existingMap = new Map(currentStudents.map((s) => [s.jshshir, s]));

    let addedCount = 0;
    let skippedDb = 0;
    const toCommitFirestore: StudentDoc[] = [];

    for (const jsh of uniqueSet) {
      const existing = existingMap.get(jsh);
      if (existing) {
        if (existing.groupId !== groupId) {
          existing.groupId = groupId;
          existing.groupName = groupName;
          existing.updatedAt = new Date().toISOString();
          addedCount++;
          toCommitFirestore.push(existing);
        } else {
          skippedDb++;
        }
      } else {
        const newDoc: StudentDoc = {
          jshshir: jsh,
          groupId,
          groupName,
          updatedAt: new Date().toISOString(),
        };
        currentStudents.push(newDoc);
        addedCount++;
        toCommitFirestore.push(newDoc);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(currentStudents));

    // Firestore Batch Writes (chunked into 450 items per batch)
    if (isFirebaseReady && firestore && toCommitFirestore.length > 0) {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < toCommitFirestore.length; i += CHUNK_SIZE) {
        const chunk = toCommitFirestore.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(firestore);
        for (const st of chunk) {
          batch.set(doc(firestore, 'students', st.jshshir), {
            ...st,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    }

    return {
      added: addedCount,
      skippedAlreadyInDb: skippedDb,
      duplicatesInInput: duplicateInInput,
      invalidFormat: invalidCount,
      totalFound: uniqueSet.size,
    };
  }

  // --- BACKUP ---
  exportBackup(): string {
    this.initLocal();
    const data = {
      groups: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.GROUPS) || '[]'),
      schedules: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SCHEDULES) || '[]'),
      students: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS) || '[]'),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  importBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.groups) && Array.isArray(data.students)) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.GROUPS, JSON.stringify(data.groups));
        localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
        if (Array.isArray(data.schedules)) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.SCHEDULES, JSON.stringify(data.schedules));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const adminService = new AdminService();
