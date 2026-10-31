
'use client';

import React, { useState, useRef, useEffect } from 'react';

export function DemoRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const personas = [
    {
      id: 'admin',
      name: 'Elena Rostova',
      role: 'Admin',
      email: 'admin@brightloop.com',
      password: 'Admin@12345!',
      target: '/dashboard',
    },
    {
      id: 'staff',
      name: 'Sarah Jenkins',
      role: 'Staff',
      email: 'sarah.sales@brightloop.com',
      password: 'Staff@12345!',
      target: '/dashboard',
    },
    {
      id: 'customer',
      name: 'Alex Lindqvist',
      role: 'Customer',
      email: 'alex@nordicretail.com',
      password: 'Customer@12345!',
      target: '/portal',
    },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (email: string, password: string, target: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = target;
      }
    } catch (err) {
      console.error('Failed to switch persona', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 press-feedback disabled:opacity-50"
      >
        <span>Try a demo</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-slate-200 shadow-dropdown p-1.5 z-50 text-xs">
          <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Switch Demo Account
          </div>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSwitch(p.email, p.password, p.target)}
              disabled={loading}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-slate-800 transition-colors"
            >
              <div className="truncate">
                <div className="font-medium text-slate-900 truncate">{p.name}</div>
                <div className="text-[11px] text-slate-500">{p.email}</div>
              </div>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ml-2">
                {p.role}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
