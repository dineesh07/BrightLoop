'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

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

        <div className="p-4 bg-ground border border-border rounded-card text-right">
          <div className="text-xs text-muted">Current Amount Due</div>
          <div className="text-xl font-bold tabular-nums text-text">
            ${totalDue.toFixed(2)}
          </div>
          {unpaidInvoices.length > 0 && (
            <div className="text-[11px] text-negative font-medium">
              {unpaidInvoices.length} invoice(s) awaiting payment
            </div>
          )}
        </div>
      </div>

      {/* Active Subscriptions Section */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">My Subscriptions ({subscriptions.length})</h2>
            <p className="text-xs text-muted">Active plans, renewal schedules, and contract controls.</p>
          </div>
          <Link
            href="/subscriptions/new"
            className="px-3 py-1 text-xs font-semibold bg-accent text-white rounded hover:opacity-90"
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
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Subscription</th>
                  <th>Plan & Frequency</th>
                  <th>Contract Items</th>
                  <th>Next Renewal Date</th>
                  <th>Status</th>
                  <th className="text-right">Self-Service Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-mono text-xs font-semibold text-chartHue">
                      {sub.subscriptionNumber}
                    </td>
                    <td>
                      <div className="font-semibold text-text">{sub.plan.name}</div>
                      <div className="text-xs text-muted">
                        ${sub.plan.cost} / {sub.plan.billingInterval.toLowerCase()}
                      </div>
                    </td>
                    <td className="text-xs text-muted">
                      {sub.lines.length} service line(s)
                    </td>
                    <td className="text-xs font-medium tabular-nums text-text">
                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {sub.status === 'ACTIVE' && sub.plan.allowPause && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'PAUSE')}
                            className="px-2 py-0.5 text-xs border border-border rounded text-warning hover:bg-raised"
                          >
                            Pause
                          </button>
                        )}
                        {sub.status === 'PAUSED' && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'RESUME')}
                            className="px-2 py-0.5 text-xs bg-positive text-white rounded hover:opacity-90 font-medium"
                          >
                            Resume
                          </button>
                        )}
                        {sub.status === 'ACTIVE' && sub.plan.allowEarlyClose && (
                          <button
                            onClick={() => handleSubscriptionAction(sub.id, 'CLOSE')}
                            className="px-2 py-0.5 text-xs border border-border rounded text-negative hover:bg-raised"
                          >
                            Cancel Plan
                          </button>
                        )}
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="px-2 py-0.5 text-xs bg-raised border border-border rounded text-text hover:bg-ground"
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
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">My Invoices & Payments</h2>
          <p className="text-xs text-muted">Review current and historical bills or make an instant payment.</p>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-semibold">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline text-chartHue">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="text-xs tabular-nums text-muted">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="text-xs tabular-nums text-muted">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="text-right text-xs font-semibold tabular-nums text-text">
                        ${inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="text-right text-xs tabular-nums text-positive">
                        ${inv.amountPaid.toFixed(2)}
                      </td>
                      <td className="text-right text-xs tabular-nums font-bold">
                        <span className={balance > 0 ? 'text-negative' : 'text-positive'}>
                          ${balance.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {balance > 0 ? (
                            <button
                              onClick={() => openPayModal(inv)}
                              className="px-2.5 py-1 text-xs bg-accent text-white rounded font-medium hover:opacity-90"
                            >
                              Pay Now (${balance.toFixed(2)})
                            </button>
                          ) : (
                            <span className="text-xs text-positive font-medium">Settled</span>
                          )}
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2 py-0.5 text-xs border border-border rounded hover:bg-raised text-text"
                          >
                            PDF
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
                <div className="text-muted">Total: ${payInvoice.grandTotal.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted">Balance Due</div>
                <div className="text-base font-bold text-negative tabular-nums">
                  ${Math.max(0, payInvoice.grandTotal - payInvoice.amountPaid).toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Amount to Pay ($) *</label>
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
                {paying ? 'Authorizing...' : `Pay $${payAmount.toFixed(2)} Now`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
