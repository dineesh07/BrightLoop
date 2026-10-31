'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { formatINR } from '@/lib/currency';
import { downloadReceiptFile } from '@/lib/receiptGenerator';
import { Download } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Invoices &amp; Receivables</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage billing documents, record payments, and monitor collection statuses.
          </p>
        </div>

        <Link
          href="/billing"
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback transition-all"
        >
          Billing Day Center
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented track */}
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

        <form onSubmit={(e) => { e.preventDefault(); fetchInvoices(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
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

      {/* Invoices Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">Loading invoices ledger...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">Number</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Customer</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Subscription</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Issue Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Total</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Paid</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Balance Due</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right min-w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const balance = Math.max(0, inv.grandTotal - inv.amountPaid);
                  const isPastDue = new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' && inv.status !== 'CANCELLED';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold whitespace-nowrap">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">{inv.customer.name}</div>
                        <div className="text-[11px] text-slate-500">{inv.customer.companyName || inv.customer.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {inv.subscription ? inv.subscription.subscriptionNumber : 'Direct'}
                      </td>
                      <td className="py-3.5 px-4 text-xs tabular-nums text-slate-500 whitespace-nowrap">
                        {new Date(inv.issueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-xs tabular-nums whitespace-nowrap">
                        <span className={isPastDue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                          {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                        </span>
                        {isPastDue && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded">
                            OVERDUE
                          </span>
                        )}
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
                        <StatusBadge status={isPastDue && inv.status === 'CONFIRMED' ? 'OVERDUE' : inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          {inv.status === 'DRAFT' && (
                            <>
                              <button
                                onClick={() => handleAction(inv.id, 'confirm')}
                                className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-subtle font-medium transition-all press-feedback whitespace-nowrap inline-flex items-center"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleAction(inv.id, 'cancel')}
                                className="px-2.5 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {inv.status === 'CONFIRMED' && balance > 0 && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-subtle font-semibold transition-all press-feedback whitespace-nowrap inline-flex items-center"
                            >
                              Record Payment
                            </button>
                          )}

                          {(inv.status === 'PAID' || inv.amountPaid > 0) && (
                            <button
                              type="button"
                              onClick={() => downloadReceiptFile(inv)}
                              className="px-2.5 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center gap-1"
                              title="Download official receipt"
                            >
                              <Download className="w-3.5 h-3.5 text-indigo-600" />
                              Receipt
                            </button>
                          )}

                          {inv.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleAction(inv.id, 'send')}
                              className="px-2.5 py-1.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg font-medium transition-colors press-feedback whitespace-nowrap inline-flex items-center"
                              title="Send email notification"
                            >
                              {inv.sentAt ? 'Resend' : 'Send'}
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
