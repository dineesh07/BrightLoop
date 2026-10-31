'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
      } else {
        if (data.user.role === 'CUSTOMER') {
          router.push('/portal');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = (id: string, em: string, pw: string) => {
    setSelectedPersona(id);
    setEmail(em);
    setPassword(pw);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & System Features */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow accents */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-white">Bright<span className="text-blue-400">loop</span></span>
                <span className="block text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Recurring Platform</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-4">
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                One platform to run plans, subscriptions, and billing.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Automate your entire recurring billing cycle from quote and plan setup to tax rules, invoice dispatch, and live revenue telemetry.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Idempotent Billing Day</div>
                  <div className="text-[11px] text-slate-400">Generate and dispatch hundreds of accurate invoices without duplicates or skips.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Strict Role Governance</div>
                  <div className="text-[11px] text-slate-400">Admin control, staff sales execution, and customer self-service invoice access.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Sub-2s Financial Telemetry</div>
                  <div className="text-[11px] text-slate-400">Real-time MRR, ARR, overdue aging, and payment tracking at instant speed.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative z-10 pt-8 border-t border-white/10 mt-6">
            <p className="text-xs text-slate-300 italic">
              &ldquo;Brightloop replaced our scattered renewal spreadsheets with automated billing runs that save us 40 hours every month.&rdquo;
            </p>
            <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>Elena Rostova &middot; Finance Lead, Brightloop</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials or choose a demo persona below to explore.
              </p>
            </div>

            {/* Quick Demo Persona Picker */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Select a Demo Persona:</span>
                <span className="text-[11px] text-slate-400 font-normal">One-click auto-fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPersona('admin', 'admin@brightloop.com', 'Admin@12345!')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedPersona === 'admin'
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Elena</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-700">Admin</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">Full Control</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPersona('staff', 'sarah.sales@brightloop.com', 'Staff@12345!')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedPersona === 'staff'
                      ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20 shadow-sm'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Sarah</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-700">Staff</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">Sales & Quotes</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPersona('customer', 'alex@nordicretail.com', 'Customer@12345!')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedPersona === 'customer'
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                    <span>Alex</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-700">Client</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">Customer Portal</div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedPersona(null);
                    }}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-700 font-semibold">Password</label>
                  <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-[11px]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedPersona(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign in to Dashboard</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              New to Brightloop?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Create a customer account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
