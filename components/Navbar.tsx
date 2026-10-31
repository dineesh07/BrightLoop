'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrightloopLogo } from './BrightloopLogo';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // 4 links max for public visitors
  const publicLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#workflow', label: 'Workflow' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#preview', label: 'Live Preview' },
  ];

  const appLinks = user?.role === 'CUSTOMER'
    ? [
        { href: '/portal', label: 'Portal' },
        { href: '/subscriptions', label: 'Subscriptions' },
        { href: '/invoices', label: 'Invoices' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/subscriptions', label: 'Subscriptions' },
        { href: '/billing', label: 'Billing Day' },
        { href: '/invoices', label: 'Invoices' },
      ];

  const activeLinks = user ? appLinks : publicLinks;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 backdrop-blur-md ${
        scrolled
          ? 'bg-white/85 border-b border-slate-200/80 shadow-subtle'
          : 'bg-white/70 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link
            href={user ? (user.role === 'CUSTOMER' ? '/portal' : '/dashboard') : '/'}
            className="flex items-center"
          >
            <BrightloopLogo size="md" showText={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {activeLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <div className="hidden sm:block">
                <DemoRoleSwitcher />
              </div>
              <Link
                href="/auth/login"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard"
                className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center press-feedback shadow-subtle"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs text-slate-600 font-medium truncate max-w-[150px]">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2 py-1"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle (min 44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-2">
          {activeLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <DemoRoleSwitcher />
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-indigo-600 px-3 py-2"
              >
                Sign in →
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
