'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Sun,
  Moon,
} from 'lucide-react';
import { BrightloopLogo } from './BrightloopLogo';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './ui/tooltip';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from './ui/popover';

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

  // Collapsed state persisted in a cookie + localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Read initial cookie on mount
  useEffect(() => {
    try {
      const match = document.cookie.match(/brightloop_sidebar_collapsed=(true|false)/);
      if (match) {
        setIsCollapsed(match[1] === 'true');
      } else {
        const saved = localStorage.getItem('brightloop_sidebar_collapsed');
        if (saved !== null) {
          setIsCollapsed(saved === 'true');
        }
      }

      // Check current theme
      const savedTheme = localStorage.getItem('brightloop_theme');
      if (
        savedTheme === 'dark' ||
        document.documentElement.classList.contains('dark')
      ) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        document.cookie = `brightloop_sidebar_collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem('brightloop_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Keyboard shortcut [ to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Theme toggle
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('brightloop_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
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

  const renderNavList = (inDrawer: boolean = false) => {
    const showFull = inDrawer || isExpanded;

    return (
      <TooltipProvider delayDuration={150}>
        <div className="py-2 overflow-y-auto max-h-[calc(100dvh-140px)] space-y-1">
          {user?.role === 'CUSTOMER' ? (
            <div className="space-y-1 px-2">
              {customerNav.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);

                if (!showFull) {
                  return (
                    <Tooltip key={item.href} delayDuration={150}>
                      <TooltipTrigger>
                        <Link
                          href={item.href}
                          aria-label={item.label}
                          className={`relative min-h-[44px] h-[44px] w-[44px] mx-auto flex items-center justify-center rounded-xl transition-all select-none press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                            active
                              ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-subtle'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          {active && (
                            <span
                              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-600 rounded-r-full"
                              aria-hidden="true"
                            />
                          )}
                          <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-label={item.label}
                    className={`relative min-h-[44px] h-[44px] px-3 flex items-center gap-3 rounded-xl text-xs font-medium transition-all select-none press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-600 rounded-r-full"
                        aria-hidden="true"
                      />
                    )}
                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-150 ease-out opacity-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            filteredAdminSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* 1px divider replacing empty gaps between groups */}
                {sIdx > 0 && (
                  <div
                    className={`h-[1px] bg-slate-200/80 my-2 ${showFull ? 'mx-3' : 'mx-2'}`}
                    role="separator"
                  />
                )}

                {showFull && (
                  <div className="px-3 pt-1 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap overflow-hidden transition-opacity duration-150">
                    {section.heading}
                  </div>
                )}

                <div className={`space-y-1 ${showFull ? 'px-2' : 'px-1'}`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isLinkActive(item.href);

                    if (!showFull) {
                      return (
                        <Tooltip key={item.href} delayDuration={150}>
                          <TooltipTrigger>
                            <Link
                              href={item.href}
                              aria-label={item.label}
                              className={`relative min-h-[44px] h-[44px] w-[44px] mx-auto flex items-center justify-center rounded-xl transition-all select-none press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                                active
                                  ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-subtle'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {active && (
                                <span
                                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-600 rounded-r-full"
                                  aria-hidden="true"
                                />
                              )}
                              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-label={item.label}
                        className={`relative min-h-[44px] h-[44px] px-3 flex items-center gap-3 rounded-xl text-xs font-medium transition-all select-none press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                          active
                            ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-subtle'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {active && (
                          <span
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-indigo-600 rounded-r-full"
                            aria-hidden="true"
                          />
                        )}
                        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className="truncate whitespace-nowrap overflow-hidden transition-opacity duration-150 ease-out opacity-100">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </TooltipProvider>
    );
  };

  const desktopSidebar = (
    <div className="flex flex-col h-full justify-between bg-white border-r border-slate-200 select-none shadow-subtle relative">
      {/* Small circular chevron toggle on the sidebar's right edge */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 after:absolute after:-inset-2.5 after:content-[''] cursor-pointer"
        title={isExpanded ? 'Collapse sidebar ([)' : 'Expand sidebar ([)'}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Top: Logo Header */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-100 transition-all ${
            isExpanded ? 'px-4' : 'px-0 justify-center'
          }`}
        >
          <Link
            href={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'}
            className="flex items-center gap-2.5 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 rounded-lg"
            title="Brightloop"
            aria-label="Brightloop Home"
          >
            <BrightloopLogo size="sm" showText={isExpanded} />
          </Link>
        </div>

        {/* Navigation list */}
        {renderNavList(false)}
      </div>

      {/* Bottom: User Profile Section */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-2.5">
        {user ? (
          !isExpanded ? (
            /* Collapsed Mode: Avatar opens a Popover */
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-full flex items-center justify-center press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                    aria-label={`User menu for ${user.name}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 bg-white border border-slate-200/90 shadow-xl rounded-2xl">
                  {/* User Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {user.email}
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Theme Toggle in Popover */}
                  <div className="py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                      <span>Appearance</span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    >
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  </div>

                  {/* Sign Out in Popover */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            /* Expanded Mode: Inline User Profile with Theme & Sign out */
            <div className="flex items-center justify-between gap-2 px-1 py-0.5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {user.role.toLowerCase()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        ) : (
          <Link
            href="/auth/login"
            className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          >
            {isExpanded ? 'Sign In' : <UserCheck className="w-5 h-5" />}
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: animates width 64px <-> 256px, 200ms ease-out */}
      <aside
        className={`hidden md:block shrink-0 sticky top-0 h-[100dvh] transition-[width] duration-200 ease-out motion-reduce:transition-none z-40 relative ${
          isExpanded ? 'w-[256px]' : 'w-[64px]'
        }`}
      >
        {desktopSidebar}
      </aside>

      {/* Mobile Top Header (Screens under 768px) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link
          href={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'}
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg"
        >
          <BrightloopLogo size="sm" showText={true} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Off-canvas Drawer (Screens under 768px) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ease-out"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Off-canvas panel */}
          <div className="relative w-[280px] max-w-[85vw] h-full bg-white shadow-2xl z-50 flex flex-col justify-between transition-transform duration-200 ease-out">
            <div>
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                <Link
                  href={user?.role === 'CUSTOMER' ? '/portal' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <BrightloopLogo size="sm" showText={true} />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation List */}
              {renderNavList(true)}
            </div>

            {/* Drawer User Footer */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate text-left">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {user.role.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors press-feedback"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Moon className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 flex items-center justify-center gap-2 transition-colors press-feedback focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center transition-colors press-feedback"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
