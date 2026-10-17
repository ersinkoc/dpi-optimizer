import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Lütfen parolayı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(password);
      if (!result.success) {
        setError(result.error || 'Hatalı parola! Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setError('Giriş yapılırken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-gray-200/50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-5 shadow-sm border border-blue-100/60">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Görsel İşleyici Girişi
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Uygulamaya erişmek için belirlenen yönetici parolasını girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm text-red-600 border border-red-100 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
              Uygulama Parolası
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                placeholder="Parolanızı girin..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-11 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Doğrulanıyor...</span>
              </>
            ) : (
              <span>Giriş Yap</span>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 border border-gray-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Tek Parola Koruması (APP_PASSWORD)
          </span>
        </div>
      </div>
    </div>
  );
};
