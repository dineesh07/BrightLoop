'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/subscriptions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load subscriptions');
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  const handleAction = async (id: string, action: string) => {
    if (!confirm(`Are you sure you want to perform '${action}' on this subscription?`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Action failed');
      } else {
        await fetchSubscriptions();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const statuses = ['ALL', 'ACTIVE', 'QUOTATION', 'CONFIRMED', 'PAUSED', 'DRAFT', 'CLOSED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Subscription Master Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle tracking: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/subscriptions/new"
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all flex items-center gap-1.5"
          >
            <span>+ New Subscription / Quote</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs - iOS/macOS smooth segmented pill control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium press-feedback ${
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-subtle font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, plan or number..."
            className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 w-64 shadow-subtle"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-subtle press-feedback transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading subscriptions ledger...</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">
            No subscriptions found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Plan & Interval</th>
                  <th>Contract Lines</th>
                  <th>Next Billing</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const linesCount = sub.lines.length;
                  const totalSeats = sub.lines.reduce((acc: number, l: any) => acc + l.quantity, 0);
                  const isDue = new Date(sub.nextBillingDate) <= new Date() && sub.status === 'ACTIVE';

                  return (
                    <tr key={sub.id}>
                      <td className="font-mono text-xs font-semibold">
                        <Link href={`/subscriptions/${sub.id}`} className="hover:underline text-chartHue">
                          {sub.subscriptionNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-medium text-text">{sub.customer.name}</div>
                        <div className="text-[11px] text-muted">
                          {sub.customer.companyName || sub.customer.email}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-text">{sub.plan.name}</div>
                        <div className="text-[11px] text-muted tracking-tight">
                          Every {sub.plan.billingInterval.toLowerCase()} · ₹{sub.plan.cost}
                        </div>
                      </td>
                      <td className="text-xs">
                        <div className="text-text">{linesCount} line item{linesCount > 1 ? 's' : ''} ({totalSeats} units)</div>
                        {sub.discountRule && (
                          <div className="text-[11px] text-chartHue font-medium">
                            Discount: {sub.discountRule.code}
                          </div>
                        )}
                      </td>
                      <td className="text-xs tabular-nums">
                        <span className={isDue ? 'text-negative font-semibold' : 'text-text'}>
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </span>
                        {isDue && <span className="ml-1 text-[10px] text-negative font-bold">DUE</span>}
                      </td>
                      <td className="text-xs text-muted">{sub.paymentTerms}</td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Stage transitions */}
                          {sub.status === 'DRAFT' && (
                            <button
                              disabled={actionLoading === sub.id}
                              onClick={() => handleAction(sub.id, 'CONFIRM')}
                              className="px-2 py-0.5 text-xs bg-raised border border-border rounded hover:bg-ground font-medium"
                            >
                              Send Quote
                            </button>
                          )}
                          {sub.status === 'QUOTATION' && (
                            <button
                              disabled={actionLoading === sub.id}
                              onClick={() => handleAction(sub.id, 'ACTIVATE')}
                              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-subtle font-medium transition-all press-feedback"
                            >
                              Confirm &amp; Activate
                            </button>
                          )}
                          {sub.status === 'CONFIRMED' && (
                            <button
                              disabled={actionLoading === sub.id}
                              onClick={() => handleAction(sub.id, 'ACTIVATE')}
                              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-subtle font-medium transition-all press-feedback"
                            >
                              Activate
                            </button>
                          )}
                          {sub.status === 'ACTIVE' && (
                            <>
                              {sub.plan.allowPause && (
                                <button
                                  disabled={actionLoading === sub.id}
                                  onClick={() => handleAction(sub.id, 'PAUSE')}
                                  className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg font-medium transition-colors press-feedback"
                                >
                                  Pause
                                </button>
                              )}
                              {sub.plan.allowEarlyClose && (
                                <button
                                  disabled={actionLoading === sub.id}
                                  onClick={() => handleAction(sub.id, 'CLOSE')}
                                  className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-medium transition-colors press-feedback"
                                >
                                  Close
                                </button>
                              )}
                            </>
                          )}
                          {sub.status === 'PAUSED' && (
                            <button
                              disabled={actionLoading === sub.id}
                              onClick={() => handleAction(sub.id, 'RESUME')}
                              className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-subtle font-medium transition-all press-feedback"
                            >
                              Resume
                            </button>
                          )}
                          {sub.status === 'CLOSED' && sub.plan.allowRenewal && (
                            <button
                              disabled={actionLoading === sub.id}
                              onClick={() => handleAction(sub.id, 'RENEW')}
                              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium transition-colors press-feedback"
                            >
                              Renew
                            </button>
                          )}
                          <Link
                            href={`/subscriptions/${sub.id}`}
                            className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition-colors press-feedback"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

