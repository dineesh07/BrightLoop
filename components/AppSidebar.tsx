'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Zap,
  Receipt,
  Package,
  CreditCard,
  FileSpreadsheet,
  Tag,
  Percent,
  Users,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { BrightloopLogo } from './BrightloopLogo';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  companyName?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  
  // Predictable, intentional collapsed state (persisted)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('brightloop_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('brightloop_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const isExpanded = !isCollapsed;

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
  };

  const customerNav: NavItem[] = [
    { href: '/portal', label: 'Portal Overview', icon: LayoutDashboard },
    { href: '/subscriptions', label: 'My Subscriptions', icon: Layers },
    { href: '/invoices', label: 'My Invoices', icon: Receipt },
  ];

  const adminNavSections = [
    {
      heading: 'Billing & Ops',
      items: [
        { href: '/dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { href: '/subscriptions', label: 'Subscriptions', icon: Layers },
        { href: '/billing', label: 'Billing Day', icon: Zap },
        { href: '/invoices', label: 'Invoices', icon: Receipt },
      ] as NavItem[],
    },
    {
      heading: 'Products & Rules',
      items: [
        { href: '/products', label: 'Products & Variants', icon: Package },
        { href: '/plans', label: 'Plans', icon: CreditCard },
        { href: '/templates', label: 'Quotation Templates', icon: FileSpreadsheet },
        { href: '/discounts', label: 'Discounts', icon: Tag },
        { href: '/taxes', label: 'Tax Rules', icon: Percent, adminOnly: true },
      ] as NavItem[],
    },
    {
      heading: 'Organization',
      items: [
        { href: '/staff', label: 'Staff Team', icon: Users, adminOnly: true },
        { href: '/portal', label: 'Customer Portal', icon: UserCheck },
      ] as NavItem[],
    },
  ];

  const filteredAdminSections = adminNavSections.map((sec) => ({
    ...sec,
    items: sec.items.filter((item) => !item.adminOnly || user?.role === 'ADMIN'),
  }));

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/portal') return pathname === '/portal';
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between bg-white border-r border-slate-200 select-none shadow-subtle">
      {/* Top: Pure Logo Header (Clean & Uncrowded) */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-100 transition-all ${
            isExpanded ? 'px-4' : 'px-0 justify-center'
          }`}
        >
          <Link
            href={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'}
            className="flex items-center gap-2.5 overflow-hidden"
            title="Brightloop"
          >
            <BrightloopLogo size="sm" showText={isExpanded} />
          </Link>
        </div>

        {/* Navigation list */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100dvh-180px)]">
          {user?.role === 'CUSTOMER' ? (
            <div className="space-y-1">
              {customerNav.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ) : (
            filteredAdminSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {isExpanded && (
                  <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {section.heading}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      } ${!isExpanded ? 'justify-center px-0' : ''}`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom: Collapse Toggle & User Profile */}
      <div className="border-t border-slate-100 bg-slate-50/50">
        {/* Dedicated Collapse / Expand Toggle Button directly ABOVE profile avatar */}
        <div className={`p-2 border-b border-slate-100/80 flex ${isExpanded ? 'px-3' : 'justify-center'}`}>
          <button
            type="button"
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors press-feedback shadow-subtle ${
              isExpanded
                ? 'w-full px-3 py-2 justify-between text-xs font-medium'
                : 'w-10 h-10 justify-center'
            }`}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <>
                <span className="text-slate-600 font-medium text-xs">Collapse</span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </>
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>

        {/* User Profile Avatar Section */}
        <div className="p-3">
          {user ? (
            <div className={`flex items-center gap-2.5 ${!isExpanded ? 'justify-center' : 'justify-between'}`}>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {isExpanded && (
                  <div className="truncate text-left">
                    <div className="text-xs font-semibold text-slate-900 truncate">{user.name}</div>
                    <div className="text-[11px] text-slate-500 capitalize">{user.role.toLowerCase()}</div>
                  </div>
                )}
              </div>
              {isExpanded ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors press-feedback"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={`w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center transition-colors ${
                !isExpanded ? 'px-0' : 'px-3'
              }`}
            >
              {isExpanded ? 'Sign In' : <UserCheck className="w-4 h-4" />}
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent Expand/Collapse) */}
      <aside
        className={`hidden lg:block shrink-0 sticky top-0 h-[100dvh] transition-all duration-200 ease-out z-40 ${
          isExpanded ? 'w-[240px]' : 'w-[68px]'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link href={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'} className="flex items-center">
          <BrightloopLogo size="sm" showText={true} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[280px] max-w-[80vw] h-full shadow-2xl z-50">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
