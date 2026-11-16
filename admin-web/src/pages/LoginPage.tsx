import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { adminService } from '../services/adminService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@texnikum.uz');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Iltimos, parolni kiriting');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminService.login(email.trim(), password.trim());
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || "Parol noto'g'ri! (Standart: admin123)");
      }
    } catch {
      setError("Tizimga kirishda kutilmagan xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100 select-none">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30 mb-5">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Texnikum Admin Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Dars jadvallari, guruhlar va JSHSHIR ro'yxatini boshqarish tizimi
          </p>

          {error && (
            <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Emaili
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@texnikum.uz"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Paroli
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Parolni kiriting (Standart: admin123)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Xavfsiz Firebase Auth va Firestore integratsiyasi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
