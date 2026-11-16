import React from 'react';
import { Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { isFirebaseReady } from '../firebase';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Sync Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isFirebaseReady
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          {isFirebaseReady ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Firestore: Bulutli Baza Ulangan</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span>Lokal Rejim (Oflayn / Mock)</span>
            </>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
