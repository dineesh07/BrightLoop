'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-text">Reset Password</h1>
        <p className="text-xs text-muted">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-surface border border-positive/30 rounded-card text-xs space-y-2">
          <div className="text-positive font-medium">{message}</div>
          {resetUrl && (
            <div className="pt-2 border-t border-rule">
              <span className="text-muted block mb-1">Simulated delivery link for testing:</span>
              <Link href={resetUrl} className="text-chartHue font-mono hover:underline break-all">
                {resetUrl}
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-card border border-border space-y-4 text-xs">
        <div>
          <label className="block text-muted font-medium mb-1">Account Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. alex@nordicretail.com"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-accent text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending Request...' : 'Send Reset Link'}
        </button>

        <div className="text-center pt-2 text-muted">
          Remembered your password?{' '}
          <Link href="/auth/login" className="text-chartHue hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

