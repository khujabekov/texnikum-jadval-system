import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  GraduationCap,
  LogOut,
  Database,
  Download,
  Upload,
} from 'lucide-react';
import { adminService } from '../services/adminService';

export type PageId = 'dashboard' | 'groups' | 'schedule' | 'students';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as PageId, label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'groups' as PageId, label: 'Guruhlar', icon: Users },
    { id: 'schedule' as PageId, label: 'Dars jadvali', icon: CalendarDays },
    { id: 'students' as PageId, label: 'Talabalar & JSHSHIR', icon: GraduationCap },
  ];

  const handleExport = () => {
    const json = adminService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `texnikum_jadval_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (adminService.importBackup(text)) {
          alert("Zaxira nusxasi muvaffaqiyatli tiklandi! Sahifa yangilanmoqda...");
          window.location.reload();
        } else {
          alert("Fayl formati noto'g'ri!");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Texnikum Jadval</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
              Web Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Backup & Tools */}
      <div className="px-4 py-4 border-t border-slate-800/80 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3">
          Zaxira va Boshqaruv
        </span>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <Download className="w-4 h-4" />
          <span>JSON Zaxiralash</span>
        </button>
        <button
          onClick={handleImport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Zaxiradan tiklash</span>
        </button>
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">admin</span>
        </button>
      </div>
    </aside>
  );
};
