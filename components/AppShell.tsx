'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Auth pages: full screen, completely unencumbered by navbars or sidebars
  if (pathname.startsWith('/auth')) {
    return <main className="w-full min-h-[100dvh] bg-ground flex flex-col">{children}</main>;
  }

  // 2. Public landing page: public marketing navbar and full-width layout
  if (pathname === '/') {
    return (
      <div className="min-h-[100dvh] bg-ground text-text flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">{children}</main>
        <footer className="border-t border-stone-200/80 bg-stone-100/60 py-8 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Brightloop Software Inc.</span>
              <span>&bull;</span>
              <span>Recurring Billing and Plan Management</span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-xs">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Application internal routes: collapsible modern AppSidebar on the left + responsive main content
  return (
    <div className="min-h-[100dvh] bg-ground text-text flex flex-col md:flex-row">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

