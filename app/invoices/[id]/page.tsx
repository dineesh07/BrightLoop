'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { BrightloopLogo } from '@/components/BrightloopLogo';
import { downloadReceiptFile } from '@/lib/receiptGenerator';
import { formatINR } from '@/lib/currency';
import { Download, Printer } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Payment Modal
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error('Invoice not found');
      const data = await res.json();
      setInvoice(data.invoice);

      if (data.invoice) {
        const bal = Math.max(0, data.invoice.grandTotal - data.invoice.amountPaid);
        setPayAmount(bal);
        setPayRef(`PAY-${Date.now().toString().slice(-6)}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const handleAction = async (actionType: 'confirm' | 'cancel' | 'send') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}/${actionType}`, { method: 'POST' });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Action failed');
      } else {
        await fetchInvoice();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: id,
          amount: Number(payAmount),
          method: payMethod,
          transactionReference: payRef,
          notes: payNotes,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Payment failed');
      } else {
        setIsPayOpen(false);
        await fetchInvoice();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-12 text-center text-xs text-negative">Invoice not found.</div>;
  }

  const balanceDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (no-print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/invoices" className="hover:underline">
            Invoices
          </Link>
          <span>/</span>
          <span className="font-mono text-text">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === 'DRAFT' && (
            <>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('confirm')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl shadow-subtle hover:bg-emerald-700 press-feedback disabled:opacity-50 whitespace-nowrap"
              >
                Confirm Invoice
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAction('cancel')}
                className="px-3.5 py-1.5 text-xs font-medium border border-rose-200 bg-rose-50/50 text-rose-700 rounded-xl hover:bg-rose-100/60 press-feedback disabled:opacity-50 whitespace-nowrap"
              >
                Cancel
              </button>
            </>
          )}

          {invoice.status === 'CONFIRMED' && balanceDue > 0 && (
            <button
              disabled={actionLoading}
              onClick={() => setIsPayOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl shadow-subtle hover:bg-indigo-700 press-feedback disabled:opacity-50 whitespace-nowrap"
            >
              Record Payment
            </button>
          )}

          <button
            onClick={() => downloadReceiptFile(invoice)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-subtle press-feedback inline-flex items-center gap-1.5 whitespace-nowrap"
            title="Download verified receipt"
          >
            <Download className="w-3.5 h-3.5" />
            Download Receipt
          </button>

          <button
            disabled={actionLoading}
            onClick={() => handleAction('send')}
            className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 press-feedback whitespace-nowrap"
          >
            {invoice.sentAt ? 'Resend to Customer' : 'Send Invoice'}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 press-feedback inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="bg-surface p-8 sm:p-10 rounded-card border border-border space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
          <div>
            <div className="mb-2">
              <BrightloopLogo size="md" showText={true} />
            </div>
            <div className="text-xs text-muted">Recurring Subscription Billing Platform</div>
            <div className="text-xs text-muted">100 Enterprise Way, Suite 400</div>
            <div className="text-xs text-muted font-mono">GSTIN: 27AABCB1234F1Z8</div>
            <div className="text-xs text-muted">billing@brightloop.com</div>
          </div>

          <div className="text-right sm:text-right">
            <h1 className="text-xl font-bold font-mono tracking-tight text-text">
              {invoice.invoiceNumber}
            </h1>
            <div className="mt-1">
              <StatusBadge status={invoice.status} />
            </div>
            <div className="mt-2 text-xs text-muted">
              Issue Date: <strong className="text-text tabular-nums">{new Date(invoice.issueDate).toLocaleDateString()}</strong>
            </div>
            <div className="text-xs text-muted">
              Due Date: <strong className="text-text tabular-nums">{new Date(invoice.dueDate).toLocaleDateString()}</strong>
            </div>
            {invoice.subscription && (
              <div className="text-xs text-muted font-mono mt-1">
                Ref: {invoice.subscription.subscriptionNumber}
              </div>
            )}
          </div>
        </div>

        {/* Bill To & Billing Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="font-semibold text-muted text-xs mb-1">
              Billed to
            </div>
            <div className="text-sm font-semibold text-text">{invoice.customer.name}</div>
            <div className="text-muted">{invoice.customer.companyName}</div>
            {invoice.customer.address && <div className="text-muted">{invoice.customer.address}</div>}
            {invoice.customer.city && (
              <div className="text-muted">
                {invoice.customer.city}, {invoice.customer.country}
              </div>
            )}
            <div className="text-muted">{invoice.customer.email}</div>
            {invoice.customer.vatNumber && (
              <div className="text-muted font-mono mt-1">VAT: {invoice.customer.vatNumber}</div>
            )}
          </div>

          <div className="sm:text-right">
            <div className="font-semibold text-muted text-xs mb-1">
              Payment terms and coverage
            </div>
            <div className="text-text font-medium">Terms: {invoice.subscription?.paymentTerms || 'Due on Receipt'}</div>
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="text-muted tabular-nums mt-1">
                Service Period:{' '}
                {new Date(invoice.billingPeriodStart).toLocaleDateString()} —{' '}
                {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
              </div>
            )}
            {invoice.sentAt && (
              <div className="text-muted tabular-nums mt-1">
                Dispatched to customer: {new Date(invoice.sentAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Tax Rate</th>
                <th className="text-right">Tax (₹)</th>
                <th className="text-right">Discount (₹)</th>
                <th className="text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line: any) => (
                <tr key={line.id}>
                  <td>
                    <div className="font-medium text-text">{line.description}</div>
                  </td>
                  <td className="text-center tabular-nums">{line.quantity}</td>
                  <td className="text-right tabular-nums">₹{line.unitPrice.toFixed(2)}</td>
                  <td className="text-right tabular-nums text-muted">{line.taxRate}%</td>
                  <td className="text-right tabular-nums text-muted">₹{line.taxAmount.toFixed(2)}</td>
                  <td className="text-right tabular-nums text-chartHue">
                    {line.discountAmount > 0 ? `-₹${line.discountAmount.toFixed(2)}` : '₹0.00'}
                  </td>
                  <td className="text-right tabular-nums font-semibold text-text">
                    ₹{line.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals Breakdown */}
        <div className="flex justify-end pt-4 border-t border-rule text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span className="tabular-nums font-medium text-text">₹{invoice.subtotal.toFixed(2)}</span>
            </div>

            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-chartHue font-medium">
                <span>Discount Applied:</span>
                <span className="tabular-nums">-₹{invoice.discountTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted">
              <span>Tax Total:</span>
              <span className="tabular-nums font-medium text-text">₹{invoice.taxTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-text pt-2 border-t border-border">
              <span>Grand Total:</span>
              <span className="tabular-nums">₹{invoice.grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-positive font-medium">
              <span>Amount Paid:</span>
              <span className="tabular-nums">-₹{invoice.amountPaid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-negative pt-1 border-t border-rule">
              <span>Balance Due:</span>
              <span className="tabular-nums">₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="pt-6 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted">
                Payment receipts ledger
              </h3>
              <button
                type="button"
                onClick={() => downloadReceiptFile(invoice)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download Tax Receipt
              </button>
            </div>
            <div className="space-y-2">
              {invoice.payments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 bg-ground rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-semibold text-text flex items-center gap-2">
                      <span>{formatINR(p.amount)} via {p.method.replace('_', ' ')}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">SETTLED</span>
                    </div>
                    <div className="text-muted text-[11px] font-mono mt-0.5">
                      Ref: {p.transactionReference} {p.notes ? `· ${p.notes}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] text-muted tabular-nums">
                      <div>{new Date(p.paymentDate).toLocaleString()}</div>
                      {p.recordedBy && <div>Recorded by {p.recordedBy.name}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadReceiptFile(invoice)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Download payment receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPayOpen && (
        <Modal
          isOpen={isPayOpen}
          onClose={() => setIsPayOpen(false)}
          title={`Record Payment for ${invoice.invoiceNumber}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-muted mb-1 font-medium">Payment Amount (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 border border-border rounded-xl bg-surface text-text tabular-nums text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2.5 border border-border rounded-xl bg-surface text-text"
              >
                <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                <option value="CREDIT_CARD">Credit Card / Stripe</option>
                <option value="DIRECT_DEBIT">Direct Debit (ACH/SEPA)</option>
                <option value="CHECK">Company Check</option>
                <option value="CASH">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Transaction Reference *</label>
              <input
                type="text"
                required
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="e.g. WIRE-89102"
                className="w-full p-2.5 border border-border rounded-xl bg-surface text-text font-mono"
              />
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Notes</label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Payment memo"
                className="w-full p-2.5 border border-border rounded-xl bg-surface text-text"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPayOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 press-feedback"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 press-feedback disabled:opacity-50"
              >
                {actionLoading ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
