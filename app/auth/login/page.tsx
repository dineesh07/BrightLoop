'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  Users,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { BrightloopLogo } from '@/components/BrightloopLogo';

type RoleType = 'ADMIN' | 'STAFF' | 'CUSTOMER';

interface RolePersona {
  role: RoleType;
  title: string;
  name: string;
  email: string;
  password: string;
  description: string;
  target: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RolePersona[] = [
  {
    role: 'ADMIN',
    title: 'Administrator',
    name: 'Elena Rostova',
    email: 'admin@brightloop.com',
    password: 'Admin@12345!',
    description: 'Runs billing day, sets tax & discount rules, full governance.',
    target: '/dashboard',
    icon: Shield,
  },
  {
    role: 'STAFF',
    title: 'Sales & Operations',
    name: 'Sarah Jenkins',
    email: 'sarah.sales@brightloop.com',
    password: 'Staff@12345!',
    description: 'Prepares quotations from templates, activates subscriptions.',
    target: '/dashboard',
    icon: Users,
  },
  {
    role: 'CUSTOMER',
    title: 'Customer Client',
    name: 'Alex Lindqvist',
    email: 'alex@nordicretail.com',
    password: 'Customer@12345!',
    description: 'Self-service portal: reviews active seats, downloads GST invoices.',
    target: '/portal',
    icon: UserCheck,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>('ADMIN');
  const [email, setEmail] = useState('admin@brightloop.com');
  const [password, setPassword] = useState('Admin@12345!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activePersona = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    const p = ROLES.find((r) => r.role === role);
    if (p) {
      setEmail(p.email);
      setPassword(p.password);
    }
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
        setError(data.error || 'Authentication failed. Please verify credentials.');
      } else {
        if (data.user?.role === 'CUSTOMER') {
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

  const handleQuickDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activePersona.email,
          password: activePersona.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Demo sign-in failed.');
      } else {
        router.push(activePersona.target);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* LEFT COLUMN: Brand Story & System Pillars (Full height) */}
      <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Back to site link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Brightloop</span>
          </Link>
        </div>

        {/* Brand identity & pillars */}
        <div className="relative z-10 my-10 space-y-8">
          <div>
            <BrightloopLogo size="lg" inverted={true} />
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-3">
              Subscription &amp; Recurring Billing System
            </p>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
              Unified control for plans, quotes, and billing day.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Brightloop replaces disjointed spreadsheets with automated renewal tracking, GST compliance, and multi-method payment reconciliation.
            </p>
          </div>

          {/* Pillars without emojis */}
          <div className="space-y-3">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Idempotent Billing Runs</div>
                <div className="text-[11px] text-slate-400">Due subscriptions generate itemized invoices with zero double billing.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Quotation Templates</div>
                <div className="text-[11px] text-slate-400">Instantiate sales quotes with pre-configured products, variants, and terms.</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <Receipt className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-white">Automated Tax &amp; Discount Rules</div>
                <div className="text-[11px] text-slate-400">Real GST rules and tiered coupons calculate and apply without manual checks.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
          <span>Role-Based Governance</span>
          <span>Admin &bull; Staff &bull; Customer</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Role-First Auth Workspace */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your role first to configure your workspace session.
            </p>
          </div>

          {/* STEP 1: SELECT WORKSPACE ROLE */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">1. Select your role</div>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleSelectRole(r.role)}
                    className={`p-3 rounded-xl border text-left transition-all press-feedback flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 text-slate-900 shadow-subtle'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="mt-2">
                      <div className="font-semibold text-xs text-slate-900">{r.title.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-500 truncate">{r.name.split(' ')[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Role Context Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-medium text-slate-800">
                <span>Signing in as {activePersona.name}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  {activePersona.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">{activePersona.description}</div>
            </div>
          </div>

          {/* QUICK 1-CLICK DEMO SIGN IN */}
          <button
            type="button"
            onClick={handleQuickDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2 press-feedback shadow-subtle disabled:opacity-50"
          >
            <span>Continue as {activePersona.name} ({activePersona.title.split(' ')[0]})</span>
            <span>&rarr;</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium absolute">
              or enter credentials
            </span>
          </div>

          {/* STEP 2: CREDENTIALS FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm text-slate-900 bg-white"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm text-slate-900 bg-white"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center press-feedback shadow-subtle disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer link to register */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">New to Brightloop? </span>
            <Link
              href="/auth/register"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create customer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
