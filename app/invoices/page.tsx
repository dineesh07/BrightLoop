'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';

function InvoicesContent() {
  const searchParams = useSearchParams();
  const initialOverdue = searchParams.get('overdue') === 'true';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState(initialOverdue ? 'OVERDUE' : 'ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [recording, setRecording] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter === 'OVERDUE') {
        params.set('overdue', 'true');
      } else if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      if (search) params.set('search', search);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load invoices');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleAction = async (id: string, actionType: 'confirm' | 'cancel' | 'send') => {
    try {
      const res = await fetch(`/api/invoices/${id}/${actionType}`, { method: 'POST' });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Action failed');
      } else {
        await fetchInvoices();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openPaymentModal = (inv: any) => {
    setPaymentInvoice(inv);
    const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
    setPayAmount(balance);
    setPayRef(`PAY-${Date.now().toString().slice(-6)}`);
    setPayNotes('Payment received from customer');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    setRecording(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: paymentInvoice.id,
          amount: Number(payAmount),
          method: payMethod,
          transactionReference: payRef,
          notes: payNotes,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Failed to record payment');
      } else {
        setPaymentInvoice(null);
        await fetchInvoices();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRecording(false);
    }
  };

  const statuses = ['ALL', 'DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">Invoices & Receivables</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage billing documents, record payments, and monitor collection statuses.
          </p>
        </div>

        <Link
          href="/billing"
          className="px-3 py-1.5 text-xs font-medium bg-chartHue text-white rounded hover:opacity-90"
        >
          Billing Day Center
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded border transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-text text-white border-text font-medium'
                  : 'bg-surface text-muted border-border hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchInvoices(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
            className="px-3 py-1 text-xs border border-border rounded bg-surface text-text w-64"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs bg-raised border border-border rounded text-text hover:bg-ground"
          >
            Search
          </button>
        </form>
      </div>

      {/* Invoices Ledger Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading invoices ledger...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Subscription</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Balance Due</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  const isPastDue = new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' && inv.status !== 'CANCELLED';

                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs font-semibold">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline text-chartHue">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td>
                        <div className="font-medium text-text">{inv.customer.name}</div>
                        <div className="text-[11px] text-muted">{inv.customer.companyName || inv.customer.email}</div>
                      </td>
                      <td className="text-xs font-mono text-muted">
                        {inv.subscription ? inv.subscription.subscriptionNumber : 'Direct'}
                      </td>
                      <td className="text-xs tabular-nums text-muted">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="text-xs tabular-nums">
                        <span className={isPastDue ? 'text-negative font-semibold' : 'text-muted'}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                        {isPastDue && <span className="ml-1 text-[10px] text-negative font-bold">OVERDUE</span>}
                      </td>
                      <td className="text-right text-xs font-semibold tabular-nums text-text">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="text-right text-xs tabular-nums text-positive">
                        ₹{inv.amountPaid.toFixed(2)}
                      </td>
                      <td className="text-right text-xs tabular-nums font-semibold">
                        <span className={balance > 0 ? 'text-negative' : 'text-positive'}>
                          ₹{balance.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={isPastDue && inv.status === 'CONFIRMED' ? 'OVERDUE' : inv.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => handleAction(inv.id, 'confirm')}
                                className="px-2 py-0.5 text-xs bg-positive text-white rounded hover:opacity-90 font-medium"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleAction(inv.id, 'cancel')}
                                className="px-2 py-0.5 text-xs bg-raised border border-border text-negative rounded hover:bg-ground"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {inv.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="px-2 py-0.5 text-xs bg-accent text-white rounded hover:opacity-90 font-medium"
                              >
                                Record Pay
                              </button>
                              <button
                                onClick={() => handleAction(inv.id, 'send')}
                                className="px-2 py-0.5 text-xs bg-raised border border-border text-text rounded hover:bg-ground"
                                title="Send email notification"
                              >
                                {inv.sentAt ? 'Resend' : 'Send'}
                              </button>
                            </>
                          )}

                          <Link
                            href={`/invoices/${inv.id}`}
                            className="px-2 py-0.5 text-xs bg-raised border border-border rounded hover:bg-ground text-text"
                          >
                            Print/View
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

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <Modal
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          title={`Record Payment for ${paymentInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-muted mb-1 font-medium">Customer</label>
              <div className="p-2 bg-raised rounded font-medium text-text">
                {paymentInvoice.customer.name} ({paymentInvoice.customer.companyName || paymentInvoice.customer.email})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted mb-1 font-medium">Payment Amount (₹ INR)</label>
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
              <label className="block text-muted mb-1 font-medium">Transaction Reference *</label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-CHASE-01928"
                className="w-full p-2 border border-border rounded bg-surface text-text font-mono"
              />
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Notes / Memo</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Optional payment comments"
                className="w-full p-2 border border-border rounded bg-surface text-text"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentInvoice(null)}
                className="px-3 py-1.5 border border-border rounded text-text hover:bg-raised"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={recording}
                className="px-3 py-1.5 bg-accent text-white rounded font-medium hover:opacity-90 disabled:opacity-50"
              >
                {recording ? 'Recording...' : 'Register Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted">Loading invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
