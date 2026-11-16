import React, { useEffect, useState } from 'react';
import {
  Plus,
  Copy,
  Clock,
  User,
  MapPin,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { WEEKDAYS, type Group, type Lesson, type Weekday } from '../types';
import { adminService } from '../services/adminService';

export const SchedulePage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<Weekday>('Dushanba');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Modals
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Lesson Form
  const [pairNumber, setPairNumber] = useState(1);
  const [timeRange, setTimeRange] = useState('08:30 - 09:50');
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Quick Copy Modal
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [copyScope, setCopyScope] = useState<'day' | 'week'>('day');
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const standardTimes: Record<number, string> = {
    1: '08:30 - 09:50',
    2: '10:00 - 11:20',
    3: '11:50 - 13:10',
    4: '13:30 - 14:50',
    5: '15:00 - 16:20',
    6: '16:30 - 17:50',
  };

  const loadGroupsAndLessons = async () => {
    const allGroups = await adminService.getGroups();
    setGroups(allGroups);

    let activeGid = selectedGroupId;
    if (!activeGid || !allGroups.some((g) => g.id === activeGid)) {
      activeGid = allGroups.length > 0 ? allGroups[0].id : '';
      setSelectedGroupId(activeGid);
    }

    if (activeGid) {
      const list = await adminService.getLessons(activeGid, selectedDay);
      setLessons(list);
    } else {
      setLessons([]);
    }
  };

  useEffect(() => {
    loadGroupsAndLessons();
  }, [selectedGroupId, selectedDay]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const openAddLesson = () => {
    setEditingLesson(null);
    setPairNumber(1);
    setTimeRange(standardTimes[1] || '08:30 - 09:50');
    setSubjectName('');
    setTeacherName('');
    setRoomNumber('302-auditoriya');
    setLessonError(null);
    setLessonModalOpen(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setPairNumber(lesson.paraNumber || lesson.pairNumber || 1);
    setTimeRange(lesson.timeRange);
    setSubjectName(lesson.subjectName);
    setTeacherName(lesson.teacherName);
    setRoomNumber(lesson.roomNumber);
    setLessonError(null);
    setLessonModalOpen(true);
  };

  const handlePairChange = (p: number) => {
    setPairNumber(p);
    if (!editingLesson && standardTimes[p]) {
      setTimeRange(standardTimes[p]);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setLessonError('Fan nomini kiriting');
      return;
    }
    if (!teacherName.trim()) {
      setLessonError("O'qituvchi ismini kiriting");
      return;
    }
    if (!roomNumber.trim()) {
      setLessonError('Xona yoki auditoriya raqamini kiriting');
      return;
    }

    setSavingLesson(true);
    setLessonError(null);

    try {
      const lessonData: Lesson = {
        id: editingLesson ? editingLesson.id : `les_${selectedGroupId}_${Date.now()}`,
        groupId: selectedGroupId,
        day: selectedDay,
        paraNumber: Number(pairNumber),
        pairNumber: Number(pairNumber),
        timeRange: timeRange.trim(),
        subjectName: subjectName.trim(),
        teacherName: teacherName.trim(),
        roomNumber: roomNumber.trim(),
      };

      await adminService.saveLesson(lessonData);
      setLessonModalOpen(false);
      await loadGroupsAndLessons();
    } catch (err: any) {
      setLessonError(err.message || 'Darsni saqlashda xatolik yuz berdi');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm(`"${lesson.subjectName}" darsini o'chirmoqchimisiz?`)) return;
    try {
      await adminService.deleteLesson(lesson.id);
      await loadGroupsAndLessons();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    }
  };

  // Quick Copy
  const openCopyModal = () => {
    const targets = groups.filter((g) => g.id !== selectedGroupId);
    setTargetGroupId(targets.length > 0 ? targets[0].id : '');
    setCopyScope('day');
    setCopyError(null);
    setCopyModalOpen(true);
  };

  const handleCopyConfirm = async () => {
    if (!targetGroupId) {
      setCopyError('Nusxalanadigan guruhni tanlang');
      return;
    }

    setCopying(true);
    setCopyError(null);
    try {
      const count = await adminService.copySchedule(
        selectedGroupId,
        targetGroupId,
        copyScope === 'day' ? selectedDay : undefined
      );
      setCopyModalOpen(false);
      alert(`${count} ta dars jadvali muvaffaqiyatli nusxalandi!`);
    } catch (err: any) {
      setCopyError(err.message || 'Nusxalashda xatolik yuz berdi');
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6">
      {/* 1. Group Selector Pill Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Guruhni tanlang:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {groups.map((group) => {
            const isSelected = group.id === selectedGroupId;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Weekday Selector + Actions Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Day Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {WEEKDAYS.map((day) => {
            const isActive = selectedDay === day.key;
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openCopyModal}
            disabled={!selectedGroup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600" />
            <span>Nusxalash</span>
          </button>

          <button
            onClick={openAddLesson}
            disabled={!selectedGroup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>+ Dars Qo'shish</span>
          </button>
        </div>
      </div>

      {/* 3. Lesson List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {selectedGroup?.name} • {selectedDay} jadvali
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {lessons.length} ta dars
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            {selectedGroup ? (
              <p>
                "{selectedGroup.name}" guruhi uchun {selectedDay} kunida darslar mavjud emas.<br />
                "+ Dars Qo'shish" tugmasi orqali yangi dars kiriting yoki boshqa guruhdan nusxalang.
              </p>
            ) : (
              <p>Iltimos, guruhni tanlang.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.pairNumber}-para • {lesson.timeRange}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditLesson(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {lesson.subjectName}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lesson.roomNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Add/Edit Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingLesson ? 'Darsni tahrirlash' : "Yangi dars qo'shish"}
              </h3>
              <button
                onClick={() => setLessonModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lessonError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{lessonError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Para raqami
                  </label>
                  <select
                    value={pairNumber}
                    onChange={(e) => handlePairChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-white font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((p) => (
                      <option key={p} value={p}>
                        {p}-para
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dars vaqti
                  </label>
                  <input
                    type="text"
                    required
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    placeholder="08:30 - 09:50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Fan nomi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Web dasturlash (React.js)"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    O'qituvchi F.I.Sh.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dots. Karimov Sh.A."
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Xona / Auditoriya
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="302-auditoriya"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {savingLesson ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Copy Modal */}
      {copyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Jadvalni nusxalash</h3>
              <button
                onClick={() => setCopyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {copyError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
                {copyError}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                <strong className="text-slate-800">{selectedGroup?.name}</strong> guruhining dars jadvalini boshqa guruhga tezkor nusxalash.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Nusxalash ko'lami:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCopyScope('day')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      copyScope === 'day'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Faqat {selectedDay}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCopyScope('week')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      copyScope === 'week'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Butun hafta (Barcha kunlar)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Qaysi guruhga nusxalansin?
                </label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-white font-medium"
                >
                  {groups
                    .filter((g) => g.id !== selectedGroupId)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCopyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleCopyConfirm}
                  disabled={copying || !targetGroupId}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {copying ? 'Nusxalanmoqda...' : 'Nusxalashni tasdiqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
