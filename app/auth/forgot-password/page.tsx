'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrightloopLogo } from '@/components/BrightloopLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (data.simulatedResetUrl) {
        setResetUrl(data.simulatedResetUrl);
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>&larr; Back to Sign in</span>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <BrightloopLogo size="lg" showText={false} className="justify-center" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
        <p className="text-xs text-slate-500">
          Enter your registered email address to receive password recovery instructions via email.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-2 shadow-sm">
          <div className="font-semibold flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{message}</span>
          </div>
          {resetUrl && (
            <div className="pt-2 border-t border-emerald-200">
              <span className="text-slate-600 block mb-1 font-medium">Direct test reset link:</span>
              <Link href={resetUrl} className="text-blue-600 font-mono hover:underline break-all bg-white p-2 rounded block border border-emerald-100">
                {resetUrl}
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1.5">Registered Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending Reset Instructions...</span>
            </>
          ) : (
            <span>Send Recovery Email</span>
          )}
        </button>

        <div className="text-center pt-2 text-slate-500">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
            Return to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
