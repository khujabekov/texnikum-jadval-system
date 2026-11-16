import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, School, Search, X } from 'lucide-react';
import type { Group, Lesson, StudentRecord } from '../types';
import { adminService } from '../services/adminService';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [courseYear, setCourseYear] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [g, l, s] = await Promise.all([
      adminService.getGroups(),
      adminService.getLessons(),
      adminService.getStudents(),
    ]);
    setGroups(g);
    setLessons(l);
    setStudents(s);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingGroup(null);
    setName('');
    setDepartment('Axborot texnologiyalari');
    setCourseYear(1);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setDepartment(group.department);
    setCourseYear(group.courseYear);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Guruh nomini kiriting');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const groupData: Group = {
        id: editingGroup ? editingGroup.id : `grp_${Date.now()}`,
        name: name.trim(),
        department: department.trim(),
        courseYear: Number(courseYear),
      };
      await adminService.saveGroup(groupData);
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: Group) => {
    const confirmed = window.confirm(
      `"${group.name}" guruhini o'chirmoqchimisiz?\n\nDiqqat: Ushbu guruhga biriktirilgan barcha darslar va JSHSHIR ro'yxatlari ham o'chiriladi.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteGroup(group.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Guruh yoki yo'nalish bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yangi Guruh Qo'shish</span>
        </button>
      </div>

      {/* Grid of Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const groupLessonsCount = lessons.filter((l) => l.groupId === group.id).length;
          const groupStudentsCount = students.filter((s) => s.groupId === group.id).length;

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {group.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{group.department}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
                    {group.courseYear}-kurs
                  </span>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3 mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Haftalik Darslar</span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {groupLessonsCount} ta
                    </p>
                  </div>
                  <div className="border-l border-slate-200">
                    <span className="text-xs text-slate-500 font-medium">Talabalar</span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {groupStudentsCount} nafar
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(group)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>
                <button
                  onClick={() => handleDelete(group)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>O'chirish</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          Guruhlar topilmadi. "+ Yangi Guruh Qo'shish" tugmasi orqali yangi guruh kiriting.
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh qo\'shish'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Guruh nomi (Masalan: 21-24 AT)
                </label>
                <input
                  type="text"
                  required
                  placeholder="21-24 AT guruhi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mutaxassislik / Yo'nalish
                </label>
                <input
                  type="text"
                  required
                  placeholder="Axborot texnologiyalari"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kurs
                </label>
                <select
                  value={courseYear}
                  onChange={(e) => setCourseYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition bg-white"
                >
                  <option value={1}>1-kurs</option>
                  <option value={2}>2-kurs</option>
                  <option value={3}>3-kurs</option>
                  <option value={4}>4-kurs</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
