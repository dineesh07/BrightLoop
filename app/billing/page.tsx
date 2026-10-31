'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export default function BillingDayPage() {
  const [dueSubscriptions, setDueSubscriptions] = useState<any[]>([]);
  const [billingLogs, setBillingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, logsRes] = await Promise.all([
        fetch('/api/subscriptions?status=ACTIVE'),
        fetch('/api/billing/logs'),
      ]);

      const subsData = await subsRes.json();
      const logsData = await logsRes.json();

      const now = new Date();
      const due = (subsData.subscriptions || []).filter((s: any) => new Date(s.nextBillingDate) <= now);
      setDueSubscriptions(due);
      setBillingLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBillingDay = async () => {
    if (!confirm('Execute automated billing cycle now? Invoices will be generated for all due subscriptions.')) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cutoffDate: new Date().toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Billing run failed');
      } else {
        setRunResult(data);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Billing Day Command Center
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Automated recurring cycle: generates invoices, calculates taxes and discounts, prevents double-billing.
          </p>
        </div>

        <button
          onClick={handleRunBillingDay}
          disabled={running}
          className="px-4 py-2 text-xs font-semibold bg-chartHue text-white rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
        >
          {running ? 'Processing Invoices...' : 'Run Billing Day Now'}
        </button>
      </div>

      {/* Live Result Banner */}
      {runResult && (
        <div className="p-4 bg-surface rounded-card border border-positive/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-positive flex items-center gap-1.5">
              <span>Billing Cycle Finished Successfully</span>
            </div>
            <span className="text-xs text-muted tabular-nums">
              Total Billed: <strong className="text-text">${runResult.totalBilled?.toFixed(2)}</strong>
            </span>
          </div>
          <div className="text-xs text-text">
            Processed {runResult.subscriptionsProcessed} subscription(s) · Created {runResult.invoicesCreated} draft invoice(s).
          </div>
          {runResult.logs && runResult.logs.length > 0 && (
            <div className="mt-2 p-2 bg-ground rounded font-mono text-[11px] text-muted max-h-36 overflow-y-auto space-y-1">
              {runResult.logs.map((log: string, idx: number) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Due for Billing */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">
              Subscriptions Due for Invoicing ({dueSubscriptions.length})
            </h2>
            <p className="text-xs text-muted">
              Active subscriptions whose billing date has arrived and are pending invoice creation.
            </p>
          </div>
          {dueSubscriptions.length > 0 && (
            <span className="text-xs font-medium text-negative bg-negative/10 px-2 py-0.5 rounded">
              Ready for Billing Run
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted">Checking subscription schedule...</div>
        ) : dueSubscriptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            All active subscriptions are currently up to date. Next billing will occur as future dates are reached.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Subscription</th>
                  <th>Customer</th>
                  <th>Plan & Interval</th>
                  <th>Lines</th>
                  <th>Billing Due Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {dueSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-mono text-xs font-medium">
                      <Link href={`/subscriptions/${sub.id}`} className="hover:underline text-chartHue">
                        {sub.subscriptionNumber}
                      </Link>
                    </td>
                    <td>
                      <div className="font-medium text-text">{sub.customer.name}</div>
                      <div className="text-[11px] text-muted">{sub.customer.companyName || sub.customer.email}</div>
                    </td>
                    <td>
                      <div className="font-medium text-text">{sub.plan.name}</div>
                      <div className="text-[11px] text-muted">Every {sub.plan.billingInterval.toLowerCase()}</div>
                    </td>
                    <td className="text-xs text-muted">{sub.lines.length} item(s)</td>
                    <td className="text-xs font-bold text-negative tabular-nums">
                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </td>
                    <td>
                      <StatusBadge status="ACTIVE" />
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/subscriptions/${sub.id}`}
                        className="px-2.5 py-1 text-xs border border-border rounded hover:bg-raised text-text font-medium"
                      >
                        Inspect Contract →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Billing Logs */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Billing Run Audit Ledger</h2>
          <p className="text-xs text-muted">Complete historical audit trail of automated and manual billing runs.</p>
        </div>

        {billingLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">No prior billing runs logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Execution Timestamp</th>
                  <th className="text-center">Subscriptions Evaluated</th>
                  <th className="text-center">Invoices Generated</th>
                  <th className="text-right">Total Amount Billed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {billingLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs tabular-nums text-text font-mono">
                      {new Date(log.executedAt).toLocaleString()}
                    </td>
                    <td className="text-center text-xs tabular-nums font-medium">
                      {log.subscriptionsProcessed}
                    </td>
                    <td className="text-center text-xs tabular-nums font-semibold text-chartHue">
                      {log.invoicesCreated}
                    </td>
                    <td className="text-right text-xs tabular-nums font-bold text-text">
                      ${log.totalBilled.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={log.status} />
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
