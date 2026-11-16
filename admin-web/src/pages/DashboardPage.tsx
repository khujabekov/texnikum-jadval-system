import React, { useEffect, useState } from 'react';
import {
  Users,
  CalendarDays,
  GraduationCap,
  ArrowRight,
  Plus,
  BookOpen,
  CloudUpload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { Group, Lesson, StudentRecord } from '../types';
import { adminService } from '../services/adminService';
import type { PageId } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);

  const handleSeedToFirestore = async () => {
    if (
      !window.confirm(
        "Boshlang'ich namunaviy guruhlar, jadvallar va talabalar ro'yxatini Firebase Firestore bulutiga yuklamoqchimisiz?"
      )
    ) {
      return;
    }
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const res = await adminService.seedInitialDataToFirestore();
      setSeedSuccess(
        `Firebase'ga yuklandi: ${res.groupsCount} ta guruh, ${res.schedulesCount} ta jadval, ${res.studentsCount} ta talaba JSHSHIRi!`
      );
      const [g, l, s] = await Promise.all([
        adminService.getGroups(),
        adminService.getLessons(),
        adminService.getStudents(),
      ]);
      setGroups(g);
      setLessons(l);
      setStudents(s);
    } catch (err: any) {
      alert(`Xatolik: ${err?.message || "Firebase'ga yuklashda xatolik yuz berdi"}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [g, l, s] = await Promise.all([
          adminService.getGroups(),
          adminService.getLessons(),
          adminService.getStudents(),
        ]);
        setGroups(g);
        setLessons(l);
        setStudents(s);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Akademik Guruhlar',
      value: groups.length,
      unit: 'ta guruh',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
      actionPage: 'groups' as PageId,
    },
    {
      label: 'Haftalik Darslar',
      value: lessons.length,
      unit: 'ta para',
      icon: CalendarDays,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
      actionPage: 'schedule' as PageId,
    },
    {
      label: 'Biriktirilgan Talabalar',
      value: students.length,
      unit: 'nafar JSHSHIR',
      icon: GraduationCap,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
      actionPage: 'students' as PageId,
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
            O'quv Bo'limi Boshqaruvi
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi Paneli
          </h1>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Bu yerdan guruhlar ro'yxatini shakllantirish, dars jadvallarini kiritish, boshqa guruhlarga nusxalash va talabalarning 14 xonali JSHSHIR raqamlarini biriktirish mumkin. Kiritilgan barcha o'zgarishlar mobil ilovada bir zumda aks etadi.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={() => onNavigate('schedule')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold shadow-lg hover:bg-indigo-50 transition active:scale-95"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Jadvalni tahrirlash</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 text-white text-sm font-bold border border-white/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>JSHSHIR yuklash</span>
            </button>
            <button
              onClick={handleSeedToFirestore}
              disabled={seeding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Bulutga yuklanmoqda...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Bazani to'ldirish (Seed Cloud)</span>
                </>
              )}
            </button>
          </div>

          {seedSuccess && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{seedSuccess}</span>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 blur-2xl"></div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {c.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {c.value}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{c.unit}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <button
                onClick={() => onNavigate(c.actionPage)}
                className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 hover:text-indigo-800 transition pt-3 border-t border-slate-100"
              >
                <span>Boshqaruvga o'tish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Groups Overview List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Guruhlar va faollik holati</h3>
          </div>
          <button
            onClick={() => onNavigate('groups')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            Barchasini ko'rish →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase font-semibold text-slate-400">
                <th className="pb-3 font-semibold">Guruh nomi</th>
                <th className="pb-3 font-semibold">Yo'nalish</th>
                <th className="pb-3 font-semibold">Kurs</th>
                <th className="pb-3 font-semibold">Darslar soni</th>
                <th className="pb-3 font-semibold">Talabalar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {groups.map((group) => {
                const groupLessons = lessons.filter((l) => l.groupId === group.id).length;
                const groupStudents = students.filter((s) => s.groupId === group.id).length;
                return (
                  <tr key={group.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-bold text-slate-900">{group.name}</td>
                    <td className="py-3.5 text-slate-600">{group.department}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {group.courseYear}-kurs
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">{groupLessons} ta dars</td>
                    <td className="py-3.5 text-slate-700">{groupStudents} nafar</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
