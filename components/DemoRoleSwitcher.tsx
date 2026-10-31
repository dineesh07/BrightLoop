'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DemoRoleSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const personas = [
    {
      id: 'admin',
      name: 'Elena (Admin)',
      email: 'admin@brightloop.com',
      password: 'Admin@12345!',
      badge: 'Admin',
    },
    {
      id: 'staff',
      name: 'Sarah (Sales Staff)',
      email: 'sarah.sales@brightloop.com',
      password: 'Staff@12345!',
      badge: 'Staff',
    },
    {
      id: 'customer',
      name: 'Alex (Customer)',
      email: 'alex@nordicretail.com',
      password: 'Customer@12345!',
      badge: 'Customer',
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
    <div className="flex items-center gap-1.5 text-xs bg-raised p-1 rounded-control border border-border">
      <span className="text-muted px-1.5 font-medium">Role Demo:</span>
      {personas.map((p) => (
        <button
          key={p.id}
          disabled={loading}
          onClick={() => handleSwitch(p.email, p.password)}
          className="px-2 py-0.5 rounded bg-surface hover:bg-ground border border-border text-text font-medium transition-colors disabled:opacity-50"
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

