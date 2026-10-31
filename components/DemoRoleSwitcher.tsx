'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DemoRoleSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const personas = [
    {
      id: 'admin',
      name: 'Elena',
      label: 'Admin',
      email: 'admin@brightloop.com',
      password: 'Admin@12345!',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
    {
      id: 'staff',
      name: 'Sarah',
      label: 'Staff',
      email: 'sarah.sales@brightloop.com',
      password: 'Staff@12345!',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    {
      id: 'customer',
      name: 'Alex',
      label: 'Customer',
      email: 'alex@nordicretail.com',
      password: 'Customer@12345!',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    },
  ];

  const handleSwitch = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch persona', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 text-xs bg-slate-100/80 p-1 rounded-lg border border-slate-200/80">
      <span className="text-slate-500 px-2 font-medium text-[11px] uppercase tracking-wider">Demo Role:</span>
      {personas.map((p) => (
        <button
          key={p.id}
          disabled={loading}
          onClick={() => handleSwitch(p.email, p.password)}
          className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-all shadow-subtle disabled:opacity-50 flex items-center gap-1.5 ${p.badgeClass}`}
          title={`Switch to ${p.name} (${p.label})`}
        >
          <span>{p.name}</span>
          <span className="text-[10px] opacity-75 font-normal">({p.label})</span>
        </button>
      ))}
    </div>
  );
}
