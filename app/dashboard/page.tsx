'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/KpiCard';
import { RevenueTrendChart, PlanDistributionChart } from '@/components/Charts';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { formatINR } from '@/lib/currency';

interface AnalyticsData {
  metrics: {
    activeSubscriptions: number;
    totalSubscriptions: number;
    mrr: number;
    arr: number;
    totalRevenueCollected: number;
    outstandingRevenue: number;
    overdueInvoicesCount: number;
    overdueAmount: number;
    responseTimeMs: number;
  };
  revenueTrend: { month: string; revenue: number }[];
  subscriptionsByPlan: { plan: string; count: number }[];
  paymentMethods: { method: string; amount: number }[];
  overdueInvoices: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState<string>('');
  const [payLoading, setPayLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      if (res.status === 401 || res.status === 403) {
        // If customer, redirect to customer portal
        window.location.href = '/portal';
        return;
      }
      if (!res.ok) throw new Error('Failed to load financial metrics');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenPayment = (inv: any) => {
    setSelectedInvoice(inv);
    const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
    setPayAmount(balance);
    setPayRef(`UPI-${Date.now().toString().slice(-6)}`);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPayLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Number(payAmount),
          method: payMethod,
          transactionReference: payRef,
          notes: 'Recorded via Executive Finance Overview',
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to record payment');
        return;
      }
      setSelectedInvoice(null);
      await fetchAnalytics();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-muted text-sm flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin"></div>
        <span>Calculating recurring ledgers &amp; sub-2s INR aggregates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
        Error loading ledger: {error}
      </div>
    );
  }

  const { metrics, revenueTrend, subscriptionsByPlan, overdueInvoices } = data!;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Finance &amp; Executive Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Subscription performance, recurring collections, and overdue receivables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/billing"
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-subtle transition-all flex items-center gap-1.5 press-feedback"
          >
            Billing Day Center
          </Link>
          <Link
            href="/subscriptions/new"
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle transition-all flex items-center gap-1.5 press-feedback"
          >
            + New Subscription
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KpiCard
          label="MRR (Monthly)"
          value={formatINR(metrics.mrr, { showDecimals: false })}
          subline="Normalized recurring"
          highlight={true}
        />
        <KpiCard
          label="ARR (Annual)"
          value={formatINR(metrics.arr, { showDecimals: false })}
          subline="Annual run-rate"
        />
        <KpiCard
          label="Active Contracts"
          value={metrics.activeSubscriptions}
          subline={`of ${metrics.totalSubscriptions} total`}
        />
        <KpiCard
          label="Total Collected"
          value={formatINR(metrics.totalRevenueCollected, { showDecimals: false })}
          subline="Cash in bank"
        />
        <KpiCard
          label="Outstanding Owed"
          value={formatINR(metrics.outstandingRevenue, { showDecimals: false })}
          subline="Unpaid receivables"
        />
        <KpiCard
          label="Overdue Invoices"
          value={metrics.overdueInvoicesCount}
          subline={`${formatINR(metrics.overdueAmount, { showDecimals: false })} past due`}
          isPositiveChange={metrics.overdueInvoicesCount === 0}
          deltaText={metrics.overdueInvoicesCount > 0 ? 'Requires Action' : 'All Clear'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-text">Recurring Revenue Trend</h2>
              <p className="text-xs text-muted">Monthly billing &amp; renewals collected</p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Amounts in ₹
            </span>
          </div>
          <RevenueTrendChart data={revenueTrend} />
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-text">Subscriptions by Plan</h2>
              <p className="text-xs text-muted">Active subscriber distribution</p>
            </div>
          </div>
          <PlanDistributionChart data={subscriptionsByPlan} />
        </div>
      </div>

      {/* Overdue Invoices Alert Section */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-white">
          <div>
            <h2 className="text-sm font-bold text-text">Overdue Invoices &amp; Collections Queue</h2>
            <p className="text-xs text-muted mt-0.5">
              Receivables with passed due dates requiring follow-up before turning into revenue loss.
            </p>
          </div>
          <Link
            href="/invoices?overdue=true"
            className="text-xs text-brand hover:underline font-semibold"
          >
            View all overdue ({metrics.overdueInvoicesCount}) →
          </Link>
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No overdue invoices at this time. All customer receivables are fully settled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th className="text-right">Total (₹)</th>
                  <th className="text-right">Balance Due (₹)</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-bold text-brand">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-semibold text-text">{inv.customer.name}</div>
                        <div className="text-[11px] text-muted">{inv.customer.companyName || inv.customer.email}</div>
                      </td>
                      <td className="text-xs text-negative font-semibold tabular-nums">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="text-right font-medium tabular-nums">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="text-right font-bold text-negative tabular-nums">
                        {formatINR(balance)}
                      </td>
                      <td>
                        <StatusBadge status="OVERDUE" />
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-3 py-1.5 text-xs bg-brand hover:bg-brand-hover text-white rounded-lg font-semibold shadow-sm transition-all"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-muted mb-1 font-semibold">Customer</label>
              <div className="p-2.5 bg-raised rounded-lg font-semibold text-text">
                {selectedInvoice.customer.name} ({selectedInvoice.customer.companyName || selectedInvoice.customer.email})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted mb-1 font-semibold">Payment Amount (₹ INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-border rounded-lg bg-surface text-text tabular-nums text-sm font-bold focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 border border-border rounded-lg bg-surface text-text font-medium focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  <option value="BANK_TRANSFER">UPI / IMPS / NEFT</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="STRIPE">Razorpay / NetBanking</option>
                  <option value="DIRECT_DEBIT">eNACH / Auto-Debit</option>
                  <option value="CHECK">Company Cheque</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-muted mb-1 font-semibold">Transaction Reference / UTR Number</label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. UPI-2026-98124 or HDFC-UTR"
                className="w-full p-2.5 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-3.5 py-2 border border-border rounded-lg text-text hover:bg-raised font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payLoading}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg font-bold shadow-brand transition-all disabled:opacity-50"
              >
                {payLoading ? 'Recording...' : 'Confirm INR Settlement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

