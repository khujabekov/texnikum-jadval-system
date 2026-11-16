import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Trash2,
  Search,
  X,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Group, StudentRecord } from '../types';
import { adminService } from '../services/adminService';

export const StudentsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState('');

  // Single Add Modal
  const [singleModalOpen, setSingleModalOpen] = useState(false);
  const [singleJshshir, setSingleJshshir] = useState('');
  const [singleName, setSingleName] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Bulk Import Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadData = async () => {
    const allGroups = await adminService.getGroups();
    setGroups(allGroups);

    let activeGid = selectedGroupId;
    if (!activeGid || !allGroups.some((g) => g.id === activeGid)) {
      activeGid = allGroups.length > 0 ? allGroups[0].id : '';
      setSelectedGroupId(activeGid);
    }

    if (activeGid) {
      const list = await adminService.getStudents(activeGid);
      setStudents(list);
    } else {
      setStudents([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGroupId]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  // Parse bulk text in real-time
  const bulkStats = useMemo(() => {
    const tokens = bulkText
      .split(/[\r\n,;\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const valid: string[] = [];
    let invalid = 0;

    for (const t of tokens) {
      if (/^\d{14}$/.test(t)) {
        valid.push(t);
      } else {
        invalid++;
      }
    }

    const unique = Array.from(new Set(valid));
    const duplicates = valid.length - unique.length;

    return {
      validUnique: unique,
      duplicatesCount: duplicates,
      invalidCount: invalid,
    };
  }, [bulkText]);

  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanJsh = singleJshshir.trim();
    if (!/^\d{14}$/.test(cleanJsh)) {
      setSingleError('JSHSHIR aynan 14 ta raqamdan iborat bo\'lishi shart');
      return;
    }

    try {
      await adminService.addStudent({
        jshshir: cleanJsh,
        groupId: selectedGroupId,
        groupName: selectedGroup?.name || 'Guruh',
        fullName: singleName.trim() || undefined,
        enrolledAt: new Date().toISOString(),
      });
      setSingleModalOpen(false);
      setSingleJshshir('');
      setSingleName('');
      await loadData();
    } catch (err: any) {
      setSingleError(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleBulkImport = async () => {
    if (bulkStats.validUnique.length === 0) {
      alert("Matnda 14 xonali JSHSHIR raqamlari topilmadi!");
      return;
    }

    setBulkLoading(true);
    try {
      const res = await adminService.bulkImportStudents(bulkText, selectedGroupId);
      setBulkModalOpen(false);
      setBulkText('');
      alert(
        `Muvaffaqiyatli yuklandi!\n\n• Yangi biriktirildi: ${res.added} ta\n• Bazada oldin bor bo'lgan: ${res.skippedAlreadyInDb} ta\n• Takroriy kiritmalar: ${res.duplicatesInInput} ta`
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Yuklashda xatolik yuz berdi');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async (student: StudentRecord) => {
    if (!window.confirm(`${student.jshshir} raqamli talabani guruhdan o'chirmoqchimisiz?`)) return;
    try {
      await adminService.deleteStudent(student.jshshir);
      await loadData();
    } catch (err: any) {
      alert(err.message || "O'chirishda xatolik yuz berdi");
    }
  };

  const insertSample = () => {
    const samples = [
      '31201990010011',
      '41502980020022',
      '52003970030033',
      '60104960040044',
      '30505950050055',
    ].join('\n');
    setBulkText((prev) => (prev ? prev + '\n' + samples : samples));
  };

  const filteredStudents = students.filter(
    (s) =>
      s.jshshir.includes(search) ||
      (s.fullName && s.fullName.toLowerCase().includes(search.toLowerCase()))
  );

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

      {/* 2. Search & Action Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="JSHSHIR yoki ism bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSingleError(null);
              setSingleModalOpen(true);
            }}
            disabled={!selectedGroup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Yakka JSHSHIR</span>
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            disabled={!selectedGroup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ro'yxat orqali yuklash</span>
          </button>
        </div>
      </div>

      {/* 3. Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              {selectedGroup?.name} talabalari
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            Jami: {filteredStudents.length} nafar
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Ushbu guruhga hali talabalar biriktirilmagan. "+ Yakka JSHSHIR" yoki "Ro'yxat orqali yuklash" orqali yangi talabalarni qo'shing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-semibold text-slate-400">
                  <th className="pb-3">#</th>
                  <th className="pb-3">JSHSHIR Raqami</th>
                  <th className="pb-3">F.I.Sh. (Talaba)</th>
                  <th className="pb-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, i) => (
                  <tr key={st.jshshir} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                    <td className="py-3 font-mono font-bold text-slate-900 tracking-wider">
                      {st.jshshir}
                    </td>
                    <td className="py-3 font-medium text-slate-700">
                      {st.fullName || <span className="text-slate-400 italic">Kiritilmagan</span>}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(st)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Add Modal */}
      {singleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Yakka JSHSHIR biriktirish</h3>
              <button
                onClick={() => setSingleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {singleError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
                {singleError}
              </div>
            )}

            <form onSubmit={handleSingleAdd} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  JSHSHIR (14 ta raqam)
                </label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  placeholder="12345678901234"
                  value={singleJshshir}
                  onChange={(e) => setSingleJshshir(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Talaba F.I.Sh. (ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Abdullayev Jasur Rustam o'g'li"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSingleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={singleJshshir.length !== 14}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  Guruhga biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ro'yxat orqali yuklash</h3>
                <p className="text-xs text-slate-500 mt-0.5">Guruh: {selectedGroup?.name}</p>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Talabalar JSHSHIR raqamlari ro'yxatini quyidagi maydonga joylashtiring (yangi qator, vergul yoki bo'sh joy bilan ajratilgan bo'lishi mumkin):
              </p>

              <textarea
                rows={7}
                placeholder="Masalan:&#10;12345678901234&#10;98765432109876&#10;54321098765432"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />

              {/* Real-time Detection Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Aniqlangan to'g'ri JSHSHIR: {bulkStats.validUnique.length} ta</span>
                </div>
                {bulkStats.duplicatesCount > 0 && (
                  <div className="flex items-center gap-2 text-amber-600 font-medium pl-6">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{bulkStats.duplicatesCount} ta takroriy kiritma chetlatiladi</span>
                  </div>
                )}
                {bulkStats.invalidCount > 0 && (
                  <div className="flex items-center gap-2 text-rose-600 font-medium pl-6">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{bulkStats.invalidCount} ta noto'g'ri formatdagi token e'tiborga olinmaydi</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={insertSample}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Namunaviy 5 ta JSHSHIR qo'shish</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkImport}
                    disabled={bulkLoading || bulkStats.validUnique.length === 0}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                  >
                    {bulkLoading ? 'Yuklanmoqda...' : `Yuklash (${bulkStats.validUnique.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
