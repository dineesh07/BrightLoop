'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/StatusBadge';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subscriptions/${id}`);
      if (!res.ok) throw new Error('Failed to load subscription details');
      const data = await res.json();
      setSubscription(data.subscription);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSubscription();
  }, [id]);

  const handleAction = async (action: string) => {
    if (!confirm(`Confirm action '${action}'?`)) return;
    setActionLoading(true);
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
        await fetchSubscription();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoiceNow = async () => {
    if (!confirm('Run billing cycle for this subscription now?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cutoffDate: new Date(Date.now() + 86400000).toISOString() }),
      });
      const data = await res.json();
      alert(`Billing run result: ${data.invoicesCreated} invoice(s) generated.`);
      await fetchSubscription();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-muted">Loading subscription contract...</div>;
  }

  if (!subscription) {
    return <div className="p-12 text-center text-xs text-negative">Subscription not found.</div>;
  }

  const subtotal = subscription.lines.reduce(
    (acc: number, l: any) => acc + l.unitPrice * l.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <Link href="/subscriptions" className="hover:underline">
              Subscriptions
            </Link>
            <span>/</span>
            <span className="font-mono text-text">{subscription.subscriptionNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-text flex items-center gap-3">
            <span>{subscription.subscriptionNumber}</span>
            <StatusBadge status={subscription.status} />
          </h1>
        </div>

        {/* Action Buttons based on Lifecycle */}
        <div className="flex items-center gap-2">
          {subscription.status === 'DRAFT' && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction('CONFIRM')}
              className="px-3 py-1.5 text-xs font-medium bg-chartHue text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              Convert to Quotation
            </button>
          )}

          {subscription.status === 'QUOTATION' && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction('ACTIVATE')}
              className="px-3 py-1.5 text-xs font-medium bg-positive text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              Sign Quote & Activate
            </button>
          )}

          {subscription.status === 'CONFIRMED' && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction('ACTIVATE')}
              className="px-3 py-1.5 text-xs font-medium bg-positive text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              Activate Subscription
            </button>
          )}

          {subscription.status === 'ACTIVE' && (
            <>
              {subscription.plan.allowPause && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction('PAUSE')}
                  className="px-3 py-1.5 text-xs font-medium border border-border bg-surface text-warning rounded hover:bg-raised disabled:opacity-50"
                >
                  Pause
                </button>
              )}
              {subscription.plan.allowEarlyClose && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction('CLOSE')}
                  className="px-3 py-1.5 text-xs font-medium border border-border bg-surface text-negative rounded hover:bg-raised disabled:opacity-50"
                >
                  Close Early
                </button>
              )}
              <button
                disabled={actionLoading}
                onClick={handleGenerateInvoiceNow}
                className="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded hover:opacity-90 disabled:opacity-50"
              >
                Bill Now
              </button>
            </>
          )}

          {subscription.status === 'PAUSED' && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction('RESUME')}
              className="px-3 py-1.5 text-xs font-medium bg-positive text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              Resume Active State
            </button>
          )}

          {subscription.status === 'CLOSED' && subscription.plan.allowRenewal && (
            <button
              disabled={actionLoading}
              onClick={() => handleAction('RENEW')}
              className="px-3 py-1.5 text-xs font-medium bg-positive text-white rounded hover:opacity-90 disabled:opacity-50"
            >
              Renew Subscription
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Customer Information */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-2">
          <div className="text-muted font-semibold uppercase tracking-wider text-[11px]">
            Customer Details
          </div>
          <div className="text-sm font-semibold text-text">{subscription.customer.name}</div>
          <div className="text-muted">{subscription.customer.companyName || 'Individual Account'}</div>
          <div className="text-muted">{subscription.customer.email}</div>
          {subscription.customer.vatNumber && (
            <div className="text-[11px] text-muted">VAT: {subscription.customer.vatNumber}</div>
          )}
          {subscription.customer.country && (
            <div className="text-[11px] text-muted">Location: {subscription.customer.country}</div>
          )}
        </div>

        {/* Plan Terms */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-2">
          <div className="text-muted font-semibold uppercase tracking-wider text-[11px]">
            Plan & Billing Schedule
          </div>
          <div className="text-sm font-semibold text-text">{subscription.plan.name}</div>
          <div className="text-muted">
            Interval: <strong>{subscription.plan.billingInterval}</strong> (Base rate ${subscription.plan.cost})
          </div>
          <div className="text-muted">
            Next Billing Date:{' '}
            <strong className="text-text tabular-nums">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </strong>
          </div>
          <div className="text-muted">
            Payment Terms: <strong>{subscription.paymentTerms}</strong>
          </div>
          <div className="text-[11px] text-muted">
            Auto-Renew: {subscription.autoRenew ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {/* Discount & Expiry */}
        <div className="p-4 bg-surface rounded-card border border-border space-y-2">
          <div className="text-muted font-semibold uppercase tracking-wider text-[11px]">
            Rules & Concessions
          </div>
          {subscription.discountRule ? (
            <div>
              <div className="text-chartHue font-semibold">
                Applied Code: {subscription.discountRule.code}
              </div>
              <div className="text-muted mt-0.5">{subscription.discountRule.description}</div>
              <div className="text-[11px] text-muted">
                Discount Type: {subscription.discountRule.discountType} ({subscription.discountRule.value}
                {subscription.discountRule.discountType === 'PERCENTAGE' ? '%' : '$'})
              </div>
            </div>
          ) : (
            <div className="text-muted">No promotional discount applied.</div>
          )}

          <div className="pt-2 border-t border-rule text-muted">
            Start Date: {new Date(subscription.startDate).toLocaleDateString()}
          </div>
          {subscription.expiryDate && (
            <div className="text-muted">
              Contract End: {new Date(subscription.expiryDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Contract Line Items */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">Subscribed Products & Variants</h2>
            <p className="text-xs text-muted">Active components and add-ons included in this contract.</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted">Cycle Subtotal: </span>
            <span className="text-sm font-bold text-text tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th className="text-center">Quantity</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Tax Rate</th>
                <th className="text-right">Line Amount</th>
              </tr>
            </thead>
            <tbody>
              {subscription.lines.map((line: any) => (
                <tr key={line.id}>
                  <td className="font-medium text-text">{line.product.name}</td>
                  <td>
                    {line.variant ? (
                      <span className="text-xs text-chartHue font-medium">
                        {line.variant.name} (+${line.variant.priceExtra})
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Standard</span>
                    )}
                  </td>
                  <td className="text-center tabular-nums font-medium">{line.quantity}</td>
                  <td className="text-right tabular-nums">${line.unitPrice.toFixed(2)}</td>
                  <td className="text-right tabular-nums text-muted">{line.taxRate}%</td>
                  <td className="text-right tabular-nums font-semibold text-text">
                    ${(line.quantity * line.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices History */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Invoicing & Billing History</h2>
          <p className="text-xs text-muted">Invoices automatically or manually generated for this subscription.</p>
        </div>

        {subscription.invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No invoices generated yet for this subscription. Invoices will be generated automatically on Billing Day.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Paid</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {subscription.invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs font-medium">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline text-chartHue">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="text-xs tabular-nums">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="text-xs tabular-nums">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="text-right font-medium tabular-nums">
                      ${inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="text-right font-medium tabular-nums text-positive">
                      ${inv.amountPaid.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="px-2.5 py-1 text-xs border border-border rounded hover:bg-raised text-text font-medium"
                      >
                        View Invoice →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
