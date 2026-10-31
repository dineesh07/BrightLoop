'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time password criteria
  const hasMinLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password does not satisfy security requirements.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          companyName,
          country,
          vatNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-text">Create Brightloop Account</h1>
        <p className="text-xs text-muted">
          Self-service access for small businesses, agencies, and enterprises.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-surface border border-negative text-negative rounded-card text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-card border border-border space-y-4 text-xs">
        <div>
          <label className="block text-muted font-medium mb-1">Your Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Lindqvist"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">Business Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@nordicretail.com"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
          <p className="text-[11px] text-muted mt-1">Each email can belong to only one account.</p>
        </div>

        <div>
          <label className="block text-muted font-medium mb-1">Company / Organization</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nordic Retail AB"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-muted font-medium mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Sweden, US"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Tax / VAT Number</label>
            <input
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="SE556123456701"
              className="w-full p-2 border border-border rounded bg-ground text-text font-mono"
            />
          </div>
        </div>

        {/* Password and Criteria Checklist */}
        <div>
          <label className="block text-muted font-medium mb-1">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full p-2 border border-border rounded bg-ground text-text"
          />

          <div className="mt-2.5 p-2.5 bg-ground rounded border border-rule space-y-1 text-[11px]">
            <div className="font-semibold text-text mb-1">Password Security Requirements:</div>
            <div className={hasMinLength ? 'text-positive font-medium' : 'text-muted'}>
              {hasMinLength ? '[Met]' : '[Pending]'} More than 8 characters ({password.length}/9+)
            </div>
            <div className={hasUpper ? 'text-positive font-medium' : 'text-muted'}>
              {hasUpper ? '[Met]' : '[Pending]'} At least one uppercase letter (A-Z)
            </div>
            <div className={hasLower ? 'text-positive font-medium' : 'text-muted'}>
              {hasLower ? '[Met]' : '[Pending]'} At least one lowercase letter (a-z)
            </div>
            <div className={hasSpecial ? 'text-positive font-medium' : 'text-muted'}>
              {hasSpecial ? '[Met]' : '[Pending]'} At least one special character (!@#$%^&*...)
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="w-full py-2 bg-accent text-white rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>

        <div className="text-center pt-2 text-muted">
          Already registered?{' '}
          <Link href="/auth/login" className="text-chartHue hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
