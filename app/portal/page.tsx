'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { formatINR } from '@/lib/currency';
import { downloadReceiptFile } from '@/lib/receiptGenerator';
import { Download } from 'lucide-react';

export default function CustomerPortalPage() {
  const [user, setUser] = useState<any | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [payInvoice, setPayInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('CREDIT_CARD');
  const [payRef, setPayRef] = useState<string>('');
  const [paying, setPaying] = useState(false);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const [meRes, subsRes, invRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/subscriptions'),
        fetch('/api/invoices'),
      ]);

      const meData = await meRes.json();
      const subsData = await subsRes.json();
      const invData = await invRes.json();

      setUser(meData.user);
      setSubscriptions(subsData.subscriptions || []);
      setInvoices(invData.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const openPayModal = (inv: any) => {
    setPayInvoice(inv);
    const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
    setPayAmount(balance);
    setPayRef(`PORTAL-${Date.now().toString().slice(-6)}`);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoice) return;
    setPaying(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payInvoice.id,
          amount: Number(payAmount),
          method: payMethod,
          transactionReference: payRef,
          notes: 'Paid via Customer Portal Self-Service Checkout',
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Payment failed');
        return;
      }

      setPayInvoice(null);
      await loadPortalData();
      alert('Payment successfully processed! Thank you.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleSubscriptionAction = async (id: string, action: string) => {
    if (!confirm(`Are you sure you wish to ${action.toLowerCase()} this subscription?`)) return;
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
        await loadPortalData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted">Loading customer account portal...</div>;
  }

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED'
  );
  const totalDue = unpaidInvoices.reduce(
    (acc, inv) => acc + Math.max(0, inv.grandTotal - inv.amountPaid),
    0
  );

  return (
    <div className="space-y-6">
      {/* Portal Greeting */}
      <div className="bg-surface p-6 rounded-card border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-muted font-medium">Customer Self-Service Portal</div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-sm text-muted mt-1">
            {user?.companyName ? `${user.companyName} · ` : ''}
            {user?.email} · Manage your subscriptions and settle invoices without waiting.
          </p>
        </div>

        <div className="p-4 bg-ground border border-border rounded-xl text-right">
          <div className="text-xs text-muted">Current Amount Due</div>
          <div className="text-xl font-bold tabular-nums text-text">
            {formatINR(totalDue)}
          </div>
          {unpaidInvoices.length > 0 && (
            <div className="text-[11px] text-negative font-medium">
              {unpaidInvoices.length} invoice(s) awaiting payment
            </div>
          )}
        </div>
      </div>

      {/* Active Subscriptions Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Subscriptions ({subscriptions.length})</h2>
            <p className="text-xs text-slate-500">Active plans, renewal schedules, and contract controls.</p>
          </div>
          <Link
            href="/subscriptions/new"
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all flex items-center gap-1.5"
          >
            + Add New Plan
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            You do not have any active subscriptions yet.{' '}
            <Link href="/subscriptions/new" className="text-chartHue underline">
              Browse plans and create one now.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Subscription</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Plan & Frequency</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Contract Items</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Next Renewal Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right min-w-[200px]">Self-Service Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-indigo-600 whitespace-nowrap">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-xs">{sub.plan.name}</div>
                      <div className="text-xs text-slate-500">
                        {formatINR(sub.plan.cost)} / {sub.plan.billingInterval.toLowerCase()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {sub.lines.length} service line(s)
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium tabular-nums text-slate-900 whitespace-nowrap">
                      {new Date(sub.nextBillingDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                        {sub.status === 'ACTIVE' && sub.plan.allowPause && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'PAUSE')}
                            className="px-2.5 py-1.5 text-xs border border-amber-200 bg-amber-50 rounded-lg text-amber-800 hover:bg-amber-100 font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                          >
                            Pause
                          </button>
                        )}
                        {sub.status === 'PAUSED' && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'RESUME')}
                            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-subtle font-medium transition-all press-feedback whitespace-nowrap inline-flex items-center"
                          >
                            Resume
                          </button>
                        )}
                        {sub.status === 'ACTIVE' && sub.plan.allowEarlyClose && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'CLOSE')}
                            className="px-2.5 py-1.5 text-xs border border-rose-200 bg-rose-50 rounded-lg text-rose-700 hover:bg-rose-100 font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                          >
                            Cancel Plan
                          </button>
                        )}
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="px-2.5 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                        >
                          View Contract
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices & Instant Payment */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">My Invoices & Payments</h2>
          <p className="text-xs text-slate-500">Review current and historical bills or download receipts instantly.</p>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Invoice</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Issue Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Amount</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Paid</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Balance Due</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right min-w-[200px]">Payment &amp; Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold whitespace-nowrap">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs tabular-nums text-slate-500 whitespace-nowrap">
                        {new Date(inv.issueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-xs tabular-nums text-slate-500 whitespace-nowrap">
                        {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs tabular-nums text-emerald-600 font-medium whitespace-nowrap">
                        {formatINR(inv.amountPaid)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs tabular-nums font-semibold whitespace-nowrap">
                        <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {formatINR(balance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          {balance > 0 ? (
                            <button
                              onClick={() => openPayModal(inv)}
                              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-subtle font-semibold transition-all press-feedback whitespace-nowrap inline-flex items-center"
                            >
                              Pay Now ({formatINR(balance)})
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => downloadReceiptFile(inv)}
                              className="px-2.5 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center gap-1"
                              title="Download official payment receipt"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              Receipt
                            </button>
                          )}
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2.5 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-900 transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                          >
                            View
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

      {/* Pay Online Modal */}
      {payInvoice && (
        <Modal
          isOpen={!!payInvoice}
          onClose={() => setPayInvoice(null)}
          title={`Pay Invoice ${payInvoice.invoiceNumber}`}
        >
          <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-ground rounded border border-border flex justify-between items-center">
              <div>
                <div className="font-semibold text-text">Invoice {payInvoice.invoiceNumber}</div>
                <div className="text-muted">Total: ₹{payInvoice.grandTotal.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted">Balance Due</div>
                <div className="text-base font-bold text-negative tabular-nums">
                  ₹{Math.max(0, payInvoice.grandTotal - payInvoice.amountPaid).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Amount to Pay (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-border rounded bg-surface text-text tabular-nums text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2 border border-border rounded bg-surface text-text"
              >
                <option value="CREDIT_CARD">Credit / Debit Card (Stripe)</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                <option value="DIRECT_DEBIT">SEPA / ACH Direct Debit</option>
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Authorization Reference</label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                className="w-full p-2 border border-border rounded bg-surface text-text font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayInvoice(null)}
                className="px-3 py-1.5 border border-border rounded text-text hover:bg-raised"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paying}
                className="px-4 py-1.5 bg-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
              >
                {paying ? 'Authorizing...' : `Pay ₹${payAmount.toFixed(2)} Now`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
