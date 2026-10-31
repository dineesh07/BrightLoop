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
    <header className="w-full bg-ground border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Left: Wordmark & main nav */}
        <div className="flex items-center gap-6">
          <Link href={user?.role === 'CUSTOMER' ? '/portal' : '/'} className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 bg-text rounded-full inline-block group-hover:bg-chartHue transition-colors"></span>
            <span className="font-semibold text-sm tracking-tight text-text">Brightloop</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navLinks.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                      active
                        ? 'font-medium text-text bg-raised'
                        : 'text-muted hover:text-text hover:bg-raised/50'
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
            <div className="flex items-center gap-2.5 text-xs">
              <div className="text-right hidden sm:block">
                <div className="font-medium text-text">{user.name}</div>
                <div className="text-muted text-[11px] flex items-center justify-end gap-1">
                  <span>{user.companyName || user.email}</span>
                  <StatusBadge status={user.role} />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs text-muted hover:text-text hover:bg-raised rounded border border-border transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1 text-xs font-medium text-text hover:bg-raised rounded transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-3 py-1 text-xs font-medium bg-accent text-white rounded hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav strip */}
      {user && (
        <div className="md:hidden flex items-center gap-1 px-4 py-1.5 overflow-x-auto border-t border-border bg-surface">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${
                  active ? 'font-medium text-text bg-raised' : 'text-muted'
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

