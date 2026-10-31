'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Criteria
  const hasMinLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet required security criteria.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-text">Choose New Password</h1>
        <p className="text-xs text-muted">
          Update credentials for your Brightloop account.
        </p>
      </div>

      {success ? (
        <div className="p-4 bg-surface border border-positive rounded-card text-xs text-positive text-center space-y-2">
          <div className="font-bold">Password Successfully Updated!</div>
          <div className="text-muted">Redirecting you to login...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-card border border-border space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-ground border border-negative text-negative rounded text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-muted font-medium mb-1">New Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div className="p-2.5 bg-ground rounded border border-rule space-y-1 text-[11px]">
            <div className="font-semibold text-text mb-1">Password Requirements:</div>
            <div className={hasMinLength ? 'text-positive font-medium' : 'text-muted'}>
              {hasMinLength ? '[Met]' : '[Pending]'} More than 8 characters
            </div>
            <div className={hasUpper ? 'text-positive font-medium' : 'text-muted'}>
              {hasUpper ? '[Met]' : '[Pending]'} At least one uppercase letter (A-Z)
            </div>
            <div className={hasLower ? 'text-positive font-medium' : 'text-muted'}>
              {hasLower ? '[Met]' : '[Pending]'} At least one lowercase letter (a-z)
            </div>
            <div className={hasSpecial ? 'text-positive font-medium' : 'text-muted'}>
              {hasSpecial ? '[Met]' : '[Pending]'} At least one special character
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid || !token}
            className="w-full py-2 bg-accent text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted">Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
