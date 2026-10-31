'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import { StatusBadge } from './StatusBadge';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  companyName?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
  };

  const navLinks = user?.role === 'CUSTOMER'
    ? [
        { href: '/portal', label: 'Overview' },
        { href: '/subscriptions', label: 'My Subscriptions' },
        { href: '/invoices', label: 'My Invoices' },
      ]
    : [
        { href: '/', label: 'Dashboard' },
        { href: '/subscriptions', label: 'Subscriptions' },
        { href: '/billing', label: 'Billing Day' },
        { href: '/invoices', label: 'Invoices' },
        { href: '/products', label: 'Products & Variants' },
        { href: '/plans', label: 'Plans' },
        { href: '/templates', label: 'Templates' },
        { href: '/discounts', label: 'Discounts' },
        ...(user?.role === 'ADMIN'
          ? [
              { href: '/taxes', label: 'Taxes' },
              { href: '/staff', label: 'Staff' },
            ]
          : []),
        { href: '/portal', label: 'Customer Portal' },
      ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-colors shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Wordmark & main nav */}
        <div className="flex items-center gap-6">
          <Link href={user?.role === 'CUSTOMER' ? '/portal' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Bright<span className="text-blue-600">loop</span>
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all whitespace-nowrap font-medium ${
                      active
                        ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Demo Persona switcher & User identity */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <DemoRoleSwitcher />
          </div>

          {user ? (
            <div className="flex items-center gap-3 text-xs">
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-slate-900">{user.name}</div>
                <div className="text-slate-500 text-[11px] flex items-center justify-end gap-1.5">
                  <span className="truncate max-w-[140px]">{user.companyName || user.email}</span>
                  <StatusBadge status={user.role} showDot={false} />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-colors font-medium"
              >
                Sign out
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:shadow"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav strip */}
      {user && (
        <div className="md:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-border bg-white">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap font-medium ${
                  active ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
