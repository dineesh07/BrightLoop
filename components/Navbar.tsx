'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import { StatusBadge } from './StatusBadge';
import { BrightloopLogo } from './BrightloopLogo';

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
    router.push('/');
  };

  const navLinks = user?.role === 'CUSTOMER'
    ? [
        { href: '/portal', label: 'Overview' },
        { href: '/subscriptions', label: 'My Subscriptions' },
        { href: '/invoices', label: 'My Invoices' },
      ]
    : user
    ? [
        { href: '/dashboard', label: 'Dashboard' },
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
      ]
    : [
        { href: '/#features', label: 'Features' },
        { href: '/#pricing', label: 'Pricing (INR)' },
        { href: '/#telemetry', label: 'Sub-2s Engine' },
        { href: '/#security', label: 'Security & RBAC' },
      ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-colors shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-7">
          <Link href={user ? (user.role === 'CUSTOMER' ? '/portal' : '/dashboard') : '/'} className="flex items-center group">
            <BrightloopLogo size="md" showText={true} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                    active
                      ? 'text-brand bg-brand-light font-semibold border border-brand/20 shadow-subtle'
                      : 'text-muted hover:text-text hover:bg-raised'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Demo Role Switcher & User Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:block">
            <DemoRoleSwitcher />
          </div>

          {user ? (
            <div className="flex items-center gap-3 text-xs">
              <div className="text-right hidden sm:block">
                <div className="font-bold text-text">{user.name}</div>
                <div className="text-muted text-[11px] flex items-center justify-end gap-1.5">
                  <span className="truncate max-w-[140px]">{user.companyName || user.email}</span>
                  <StatusBadge status={user.role} showDot={false} />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-border hover:border-rose-200 transition-colors font-medium"
              >
                Sign out
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-semibold text-text hover:text-brand hover:bg-raised rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-bold bg-brand hover:bg-brand-hover text-white rounded-lg shadow-brand transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
              >
                <span>Live Demo</span>
                <span className="text-[10px] bg-sunburst px-1.5 py-0.2 rounded-full text-white font-extrabold uppercase">Console</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-border bg-white">
        {navLinks.map((link) => {
          const active = pathname === link.href || (link.href !== '/' && !link.href.startsWith('/#') && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap font-medium ${
                active ? 'text-brand bg-brand-light border border-brand/20 font-semibold' : 'text-muted hover:bg-raised'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
