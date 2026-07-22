'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.token);
      setUser(data);
      document.cookie = `electropro_token=${data.token}; path=/; max-age=86400`;
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full font-body-reg">
      {/* Left Panel */}
      <section className="hidden md:flex w-[45%] bg-on-secondary-fixed flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary opacity-10 rounded-full blur-[100px]" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary opacity-20 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-on-primary text-4xl">bolt</span>
            </div>
            <h1 className="text-4xl font-bold text-on-primary tracking-tight">
              ElectroPro <span className="font-light">POS</span>
            </h1>
          </div>
          <p className="font-semibold text-xl text-on-primary/90 mb-2">Manage your store smarter</p>
          <p className="text-on-primary/60 max-w-sm text-sm">
            Professional inventory, sales, and analytics tools designed for the modern electronics retailer.
          </p>
        </div>
        <div className="absolute bottom-10 left-10 flex gap-4 opacity-20">
          <span className="material-symbols-outlined text-on-primary text-6xl">memory</span>
          <span className="material-symbols-outlined text-on-primary text-6xl">developer_board</span>
          <span className="material-symbols-outlined text-on-primary text-6xl">settings_input_component</span>
        </div>
      </section>

      {/* Right Panel */}
      <section className="w-full md:w-[55%] flex items-center justify-center bg-surface-container-lowest px-6 py-12 relative">
        <div className="w-full max-w-[440px] flex flex-col">

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-error-container border border-error/20 rounded-lg">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex-1">
                <span className="font-semibold text-error text-sm block">Authentication Failed</span>
                <span className="text-on-error-container text-xs">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-error hover:opacity-70">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-xl p-8 md:p-10">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-on-background mb-1">Welcome Back</h2>
              <p className="text-on-surface-variant/80 text-sm">Sign in to your account</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">mail</span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@electropro.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-on-background"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-on-background"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-semibold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <footer className="mt-10 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-xs text-on-surface-variant/70 italic">
                Contact your administrator if you need access.
              </p>
            </footer>
          </div>

          <div className="mt-8 flex justify-center items-center gap-4 text-on-surface-variant/40 text-xs">
            <span>Version 1.0.0</span>
            <span className="w-1 h-1 bg-outline-variant/40 rounded-full" />
            <span>© 2025 ElectroPro</span>
          </div>
        </div>

        {/* Mobile logo */}
        <div className="md:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded shadow">
            <span className="material-symbols-outlined text-on-primary text-lg">bolt</span>
          </div>
          <span className="text-xl font-bold text-on-secondary-fixed">ElectroPro</span>
        </div>
      </section>
    </main>
  );
}