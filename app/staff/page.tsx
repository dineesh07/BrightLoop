'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/StatusBadge';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      if (res.status === 403) {
        setError('Unauthorized: Only system administrators can access staff management.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load staff list');
      const data = await res.json();
      setStaff(data.staff || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to create staff member');
        return;
      }

      setIsModalOpen(false);
      setEmail('');
      setName('');
      setPassword('');
      await fetchStaff();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-surface border border-negative text-negative rounded-card text-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Internal Team & Staff Control</h1>
          <p className="text-xs text-muted mt-0.5">
            Admin exclusive: invite new staff members and configure role-based access.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded hover:opacity-90"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading team roster...</div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No staff members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="font-semibold text-text">{s.name}</div>
                    </td>
                    <td className="text-xs text-muted font-mono">{s.email}</td>
                    <td>
                      <StatusBadge status={s.role} />
                    </td>
                    <td className="text-xs text-muted tabular-nums">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Wright"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Work Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="david.sales@brightloop.com"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Initial Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Must be >8 chars, with uppercase, lowercase & symbol"
              className="w-full p-2 border border-border rounded bg-ground text-text"
            />
            <p className="text-[11px] text-muted mt-1">
              Criteria: &gt;8 chars, at least one uppercase, lowercase and special character.
            </p>
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Role Permission *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'STAFF' | 'ADMIN')}
              className="w-full p-2 border border-border rounded bg-ground text-text"
            >
              <option value="STAFF">Internal Staff (Sales, Invoicing, Billing)</option>
              <option value="ADMIN">System Admin (Full System Control)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-border rounded text-text hover:bg-raised"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

