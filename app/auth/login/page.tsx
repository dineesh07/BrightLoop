'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrightloopLogo } from '@/components/BrightloopLogo';

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
          router.push('/dashboard');
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
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Story & System Features */}
        <div className="lg:col-span-5 bg-dark-mesh p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow accents */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sunburst/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Logo */}
            <div>
              <BrightloopLogo size="lg" inverted={true} useRaster={false} />
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1 ml-11">
                Recurring Billing Platform (₹ INR)
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                One platform to run plans, subscriptions, and INR billing.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Automate your entire recurring cycle: from Odoo brand variants to tax rules, invoice dispatch, and live ₹ MRR telemetry.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-brand/30 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Idempotent Billing Day</div>
                  <div className="text-[11px] text-slate-300">Generate and dispatch hundreds of accurate invoices without duplicates or skips.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-sunburst/30 text-sunburst flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  🏷️
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Product &amp; Brand Variants</div>
                  <div className="text-[11px] text-slate-300">Offer add-ons and brand editions (e.g. Odoo brand +₹560).</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  📊
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sub-2s Query Telemetry</div>
                  <div className="text-[11px] text-slate-300">Real-time ₹ MRR, ARR, overdue aging, and payment tracking in &lt;20ms.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative z-10 pt-6 border-t border-white/10 mt-6">
            <p className="text-xs text-slate-300 italic">
              &ldquo;Brightloop replaced our scattered renewal spreadsheets with automated billing runs that save us 40 hours every month.&rdquo;
            </p>
            <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sunburst inline-block"></span>
              <span>Elena Rostova &middot; Finance Lead, Brightloop</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-text">Sign in to your account</h1>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Enter your credentials or choose a demo persona below to explore.
              </p>
            </div>

            {/* Quick Demo Persona Picker */}
            <div className="p-4 rounded-2xl bg-raised border border-border space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-text">
                <span>Select a Demo Persona:</span>
                <span className="text-[11px] text-muted font-normal">One-click auto-fill</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPersona('admin', 'admin@brightloop.com', 'Admin@12345!')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPersona === 'admin'
                      ? 'bg-brand text-white border-brand ring-2 ring-brand/30 shadow-sm'
                      : 'bg-white hover:bg-ground border-border'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>Elena</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${selectedPersona === 'admin' ? 'bg-white text-brand' : 'bg-brand-light text-brand'}`}>
                      Admin
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 truncate ${selectedPersona === 'admin' ? 'text-white/80' : 'text-muted'}`}>
                    Full Control
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPersona('staff', 'sarah.sales@brightloop.com', 'Staff@12345!')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPersona === 'staff'
                      ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-600/30 shadow-sm'
                      : 'bg-white hover:bg-ground border-border'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>Sarah</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${selectedPersona === 'staff' ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700'}`}>
                      Staff
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 truncate ${selectedPersona === 'staff' ? 'text-white/80' : 'text-muted'}`}>
                    Sales &amp; Quotes
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPersona('customer', 'alex@nordicretail.com', 'Customer@12345!')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPersona === 'customer'
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/30 shadow-sm'
                      : 'bg-white hover:bg-ground border-border'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span>Alex</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${selectedPersona === 'customer' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      Client
                    </span>
                  </div>
                  <div className={`text-[10px] mt-1 truncate ${selectedPersona === 'customer' ? 'text-white/80' : 'text-muted'}`}>
                    Portal Access
                  </div>
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
                <label className="block text-text font-bold mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
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
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-xl text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-text font-bold">Password</label>
                  <Link href="/auth/forgot-password" className="text-brand hover:underline font-semibold text-[11px]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
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
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-border rounded-xl text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text transition-colors"
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
                className="w-full py-3 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm shadow-brand hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

            <div className="pt-2 text-center text-xs text-muted border-t border-rule">
              New to Brightloop?{' '}
              <Link href="/auth/register" className="text-brand font-bold hover:underline">
                Create a customer account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
