'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { formatINR } from '@/lib/currency';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [cost, setCost] = useState<number>(99);
  const [billingInterval, setBillingInterval] = useState('MONTHLY');
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [availableStartDate, setAvailableStartDate] = useState('');
  const [availableEndDate, setAvailableEndDate] = useState('');
  const [autoCloseOnEnd, setAutoCloseOnEnd] = useState(false);
  const [allowEarlyClose, setAllowEarlyClose] = useState(true);
  const [allowPause, setAllowPause] = useState(true);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          cost: Number(cost),
          billingInterval,
          minQuantity: Number(minQuantity),
          availableStartDate: availableStartDate || null,
          availableEndDate: availableEndDate || null,
          autoCloseOnEnd,
          allowEarlyClose,
          allowPause,
          allowRenewal,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to create plan');
        return;
      }

      setIsModalOpen(false);
      setName('');
      setCode('');
      setCost(99);
      await fetchPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Subscription Plans & Billing Schedules</h1>
          <p className="text-xs text-muted mt-0.5">
            Configure frequencies (daily, weekly, monthly, yearly), minimums, auto-close triggers, and pause/renewal policies.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all flex items-center gap-1.5"
        >
          + Create New Plan
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No plans configured yet.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-[26%]">Plan &amp; Code</th>
                <th className="py-3.5 px-4 w-[12%]">Interval</th>
                <th className="py-3.5 px-4 w-[14%] text-right">Base Cost</th>
                <th className="py-3.5 px-4 w-[10%] text-center">Min Qty</th>
                <th className="py-3.5 px-4 w-[16%]">Availability</th>
                <th className="py-3.5 px-4 w-[22%]">Lifecycle Policies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-xs">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{p.code}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold uppercase bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md text-slate-700">
                      {p.billingInterval}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-xs tabular-nums">
                    {formatINR(p.cost)}
                  </td>
                  <td className="py-3.5 px-4 text-center tabular-nums text-slate-600 text-xs font-medium">
                    {p.minQuantity}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {p.availableStartDate || p.availableEndDate ? (
                      <span>
                        {p.availableStartDate ? new Date(p.availableStartDate).toLocaleDateString() : 'Now'} —{' '}
                        {p.availableEndDate ? new Date(p.availableEndDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Always Open</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {p.autoCloseOnEnd && (
                        <span className="inline-flex items-center text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-md">
                          Auto-Close
                        </span>
                      )}
                      {p.allowEarlyClose ? (
                        <span className="inline-flex items-center text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                          Early Close
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60 px-2 py-0.5 rounded-md">
                          Fixed Contract
                        </span>
                      )}
                      {p.allowPause && (
                        <span className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-md">
                          Pausable
                        </span>
                      )}
                      {p.allowRenewal && (
                        <span className="inline-flex items-center text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                          Renewable
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Plan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Subscription Plan">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Annual"
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Plan Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PLAN-ENT-Y"
                className="w-full p-2 border border-border rounded bg-ground text-text font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Billing Interval *</label>
              <select
                value={billingInterval}
                onChange={(e) => setBillingInterval(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Base Cost (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Min Quantity</label>
              <input
                type="number"
                min="1"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-border rounded bg-ground text-text tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted font-medium mb-1">Available Start Date</label>
              <input
                type="date"
                value={availableStartDate}
                onChange={(e) => setAvailableStartDate(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Available End Date</label>
              <input
                type="date"
                value={availableEndDate}
                onChange={(e) => setAvailableEndDate(e.target.value)}
                className="w-full p-2 border border-border rounded bg-ground text-text"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-rule space-y-2">
            <div className="font-semibold text-text">Plan Lifecycle Policy</div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoClose"
                checked={autoCloseOnEnd}
                onChange={(e) => setAutoCloseOnEnd(e.target.checked)}
              />
              <label htmlFor="autoClose" className="text-text">
                <strong>Auto-Close:</strong> Close contract on its own when end date arrives
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="earlyClose"
                checked={allowEarlyClose}
                onChange={(e) => setAllowEarlyClose(e.target.checked)}
              />
              <label htmlFor="earlyClose" className="text-text">
                Allow customers to close or cancel early
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pause"
                checked={allowPause}
                onChange={(e) => setAllowPause(e.target.checked)}
              />
              <label htmlFor="pause" className="text-text">
                Allow customers to pause subscription temporarily
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="renew"
                checked={allowRenewal}
                onChange={(e) => setAllowRenewal(e.target.checked)}
              />
              <label htmlFor="renew" className="text-text">
                Allow subscription renewal
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors press-feedback"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback disabled:opacity-50 transition-all"
            >
              {saving ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

