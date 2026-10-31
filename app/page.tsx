'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/KpiCard';
import { RevenueTrendChart, PlanDistributionChart } from '@/components/Charts';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

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
    setPayRef(`PAY-${Date.now().toString().slice(-6)}`);
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
          notes: 'Recorded via Finance Overview',
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
      <div className="py-20 text-center text-muted text-sm">
        Calculating financial aggregates and recurring ledger...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-surface border border-negative text-negative rounded-card text-sm">
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
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Finance & Executive Overview
          </h1>
          <p className="text-sm text-muted mt-1">
            Brightloop Software recurring billing, receivables, and renewal posture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted border border-border px-2 py-1 rounded bg-surface tabular-nums">
            Engine Latency: <strong className="text-positive">{metrics.responseTimeMs}ms</strong>
          </span>
          <Link
            href="/billing"
            className="px-3 py-1.5 text-xs font-medium bg-chartHue text-white rounded hover:opacity-90 transition-opacity"
          >
            Billing Day Center
          </Link>
          <Link
            href="/subscriptions/new"
            className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded hover:opacity-90 transition-opacity"
          >
            + New Subscription
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="MRR"
          value={`$${metrics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subline="Monthly recurring"
          highlight={true}
        />
        <KpiCard
          label="ARR"
          value={`$${metrics.arr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subline="Annual run-rate"
        />
        <KpiCard
          label="Active Subscriptions"
          value={metrics.activeSubscriptions}
          subline={`of ${metrics.totalSubscriptions} total`}
        />
        <KpiCard
          label="Total Collected"
          value={`$${metrics.totalRevenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subline="Cash in bank"
        />
        <KpiCard
          label="Outstanding Owed"
          value={`$${metrics.outstandingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subline="Unpaid invoices"
        />
        <KpiCard
          label="Overdue Invoices"
          value={metrics.overdueInvoicesCount}
          subline={`$${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} past due`}
          isPositiveChange={metrics.overdueInvoicesCount === 0}
          deltaText={metrics.overdueInvoicesCount > 0 ? 'Requires action' : 'All clear'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-5 rounded-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Recurring Revenue Collection Trend</h2>
              <p className="text-xs text-muted">Trailing monthly payments collected</p>
            </div>
            <span className="text-xs text-muted tabular-nums">Currency: USD</span>
          </div>
          <RevenueTrendChart data={revenueTrend} />
        </div>

        <div className="bg-surface p-5 rounded-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-text">Subscriptions by Plan</h2>
              <p className="text-xs text-muted">Distribution of active contracts</p>
            </div>
          </div>
          <PlanDistributionChart data={subscriptionsByPlan} />
        </div>
      </div>

      {/* Overdue Invoices Alert Section */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Overdue Invoices & Collection Queue</h2>
            <p className="text-xs text-muted">
              Invoices with passed due dates requiring follow-up before becoming bad debt.
            </p>
          </div>
          <Link
            href="/invoices?overdue=true"
            className="text-xs text-chartHue hover:underline font-medium"
          >
            View all overdue ({metrics.overdueInvoicesCount}) →
          </Link>
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No overdue invoices at this time. All receivables are in good standing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Due Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueInvoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-medium">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline text-chartHue">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-medium text-text">{inv.customer.name}</div>
                        <div className="text-[11px] text-muted">{inv.customer.companyName || inv.customer.email}</div>
                      </td>
                      <td className="text-xs text-negative font-medium tabular-nums">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="text-right font-medium tabular-nums">
                        ${inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="text-right font-semibold text-negative tabular-nums">
                        ${balance.toFixed(2)}
                      </td>
                      <td>
                        <StatusBadge status="OVERDUE" />
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-2.5 py-1 text-xs bg-accent text-white rounded hover:opacity-90 font-medium"
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
              <label className="block text-muted mb-1 font-medium">Customer</label>
              <div className="p-2 bg-raised rounded font-medium text-text">
                {selectedInvoice.customer.name} ({selectedInvoice.customer.companyName || selectedInvoice.customer.email})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted mb-1 font-medium">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-border rounded bg-surface text-text tabular-nums text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-surface text-text"
                >
                  <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                  <option value="CREDIT_CARD">Credit Card / Stripe</option>
                  <option value="DIRECT_DEBIT">Direct Debit (ACH/SEPA)</option>
                  <option value="CHECK">Company Check</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Transaction Reference / Note</label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-89412 or STRIPE-TX"
                className="w-full p-2 border border-border rounded bg-surface text-text"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-3 py-1.5 border border-border rounded text-text hover:bg-raised"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={payLoading}
                className="px-3 py-1.5 bg-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
              >
                {payLoading ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
