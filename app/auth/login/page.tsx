'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        setError(data.error || 'Authentication failed');
      } else {
        if (data.user.role === 'CUSTOMER') {
          router.push('/portal');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-4 h-4 bg-text rounded-full inline-block mx-auto mb-2"></div>
        <h1 className="text-xl font-bold tracking-tight text-text">Sign in to Brightloop</h1>
        <p className="text-xs text-muted">
          Access your recurring subscriptions, billing runs, and client accounts.
        </p>
      </div>

      {/* Demo Persona Quick Fill */}
      <div className="p-4 bg-surface rounded-card border border-border space-y-2 text-xs">
        <div className="font-semibold text-text">Demo One-Click Sign-in:</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillQuickLogin('admin@brightloop.com', 'Admin@12345!')}
            className="p-2 bg-ground hover:bg-raised border border-border rounded text-center transition-colors"
          >
            <div className="font-bold text-text">Elena</div>
            <div className="text-[10px] text-muted">Admin</div>
          </button>
          <button
            type="button"
            onClick={() => fillQuickLogin('sarah.sales@brightloop.com', 'Staff@12345!')}
            className="p-2 bg-ground hover:bg-raised border border-border rounded text-center transition-colors"
          >
            <div className="font-bold text-text">Sarah</div>
            <div className="text-[10px] text-muted">Staff / Sales</div>
          </button>
          <button
            type="button"
            onClick={() => fillQuickLogin('alex@nordicretail.com', 'Customer@12345!')}
            className="p-2 bg-ground hover:bg-raised border border-border rounded text-center transition-colors"
          >
            <div className="font-bold text-text">Alex</div>
            <div className="text-[10px] text-muted">Customer</div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-surface border border-negative text-negative rounded-card text-xs">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-card border border-border space-y-4 text-xs">
        <div>
          <label className="block text-muted font-medium mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-muted font-medium">Password</label>
            <Link href="/auth/forgot-password" className="text-chartHue hover:underline text-[11px]">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-accent text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Authenticating...' : 'Sign in'}
        </button>

        <div className="text-center pt-2 text-muted">
          New to Brightloop?{' '}
          <Link href="/auth/register" className="text-chartHue hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}

