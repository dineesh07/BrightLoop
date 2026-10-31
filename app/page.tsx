'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/currency';

interface PreviewInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'PAID' | 'CONFIRMED' | 'OVERDUE' | 'DRAFT';
}

interface PreviewData {
  activeSubscriptions: number;
  revenueCollected: number;
  outstandingAmount: number;
  invoices: PreviewInvoice[];
}

const SEED_FALLBACK: PreviewData = {
  activeSubscriptions: 4,
  revenueCollected: 101916.6,
  outstandingAmount: 14160.0,
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-0001',
      customerName: 'Apex Logistics Global Inc.',
      amount: 79083.6,
      status: 'PAID',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-0002',
      customerName: 'Nordic Retail AB',
      amount: 22833.0,
      status: 'PAID',
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-0003',
      customerName: 'Urban Fleet Mobility',
      amount: 14160.0,
      status: 'OVERDUE',
    },
    {
      id: 'inv-4',
      invoiceNumber: 'INV-2026-0004',
      customerName: 'Studio Kraft Design',
      amount: 8400.0,
      status: 'CONFIRMED',
    },
  ],
};

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<PreviewData>(SEED_FALLBACK);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'CONFIRMED' | 'OVERDUE'>('ALL');
  
  // Interactive volume pricing calculator state
  const [subscriberCount, setSubscriberCount] = useState<number>(250);
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  // Fetch real preview data from API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/preview')
      .then((res) => (res.ok ? res.json() : SEED_FALLBACK))
      .then((data: PreviewData) => {
        if (isMounted && data && typeof data.activeSubscriptions === 'number') {
          setPreviewData(data);
        }
      })
      .catch(() => {
        if (isMounted) setPreviewData(SEED_FALLBACK);
      })
      .finally(() => {
        if (isMounted) {
          // Slight natural delay to showcase authentic skeleton transitions
          setTimeout(() => setLoading(false), 300);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered invoice rows in real preview
  const displayedInvoices = previewData.invoices.filter((inv) => {
    if (filterStatus === 'ALL') return true;
    return inv.status === filterStatus;
  });

  // Interactive live ledger simulation
  const handleSimulatePayment = (invoiceId: string) => {
    setPreviewData((prev) => {
      const target = prev.invoices.find((i) => i.id === invoiceId);
      if (!target || target.status === 'PAID') return prev;

      const updatedInvoices = prev.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'PAID' as const } : inv
      );

      return {
        ...prev,
        revenueCollected: prev.revenueCollected + target.amount,
        outstandingAmount: Math.max(0, prev.outstandingAmount - target.amount),
        invoices: updatedInvoices,
      };
    });
  };

  // Pricing calculations
  const baseRatePerSub = 18; // INR per active subscription
  const rawSubTotal = Math.max(2499, subscriberCount * baseRatePerSub);
  const discountRate = annualBilling ? 0.8 : 1.0;
  const netPlatformFee = Math.round(rawSubTotal * discountRate);
  const gstAmount = Math.round(netPlatformFee * 0.18);
  const totalBilled = netPlatformFee + gstAmount;

  return (
    <div className="space-y-24 py-8 max-w-6xl mx-auto px-4 sm:px-6 text-stone-900 font-sans">
      {/* 1. HERO SECTION */}
      <section className="pt-4 sm:pt-10 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-normal tracking-tight text-stone-950 leading-[1.08] [text-wrap:balance]">
          The billing ledger for subscription software.
        </h1>

        <p className="text-lg text-stone-700 max-w-[58ch] mx-auto leading-relaxed">
          Set up plans, automate recurring invoices with GST, collect customer payments in INR, and reconcile accounts receivable without spreadsheets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-stone-950 text-white font-medium text-sm transition-colors hover:bg-stone-800"
          >
            Launch Workspace
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-stone-100 text-stone-800 font-medium text-sm border border-stone-300 hover:bg-stone-200 transition-colors"
          >
            Sign in to Demo
          </Link>
        </div>
      </section>

      {/* 2. LIVE INTERACTIVE LEDGER (REAL DATA & SKELETON LOADERS) */}
      <section id="preview" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-300 pb-3">
          <div>
            <h2 className="font-serif text-2xl font-normal text-stone-950">Live Ledger Interface</h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Interactive preview querying live database records from the active billing engine.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-500 mr-1">Filter:</span>
            {(['ALL', 'PAID', 'CONFIRMED', 'OVERDUE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  filterStatus === st
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                {st === 'ALL' ? 'All Records' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="bg-white rounded-lg border border-stone-300 overflow-hidden">
          {/* Summary Metric Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border-b border-stone-200 bg-stone-50">
            {loading ? (
              <>
                <div className="p-4 space-y-2">
                  <div className="h-3 w-28 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-7 w-16 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-stone-200 rounded animate-pulse"></div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-3 w-28 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-7 w-28 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-stone-200 rounded animate-pulse"></div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="h-3 w-28 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-7 w-24 bg-stone-200 rounded animate-pulse"></div>
                  <div className="h-3 w-20 bg-stone-200 rounded animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 sm:p-5">
                  <div className="text-xs text-stone-600 font-medium">Active Contracts</div>
                  <div className="text-2xl font-semibold text-stone-950 mt-1 tabular-nums">
                    {previewData.activeSubscriptions}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Recurring billing cycles</div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="text-xs text-stone-600 font-medium">Collected Revenue</div>
                  <div className="text-2xl font-semibold text-stone-950 mt-1 tabular-nums">
                    {formatINR(previewData.revenueCollected, { showDecimals: false })}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Settled via NEFT, UPI, Cards</div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="text-xs text-stone-600 font-medium">Receivables Outstanding</div>
                  <div className="text-2xl font-semibold text-stone-950 mt-1 tabular-nums">
                    {formatINR(previewData.outstandingAmount, { showDecimals: false })}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Awaiting reconciliation</div>
                </div>
              </>
            )}
          </div>

          {/* Table Header & Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100 text-stone-600 font-medium">
                  <th className="py-3 px-4 font-medium">Invoice Reference</th>
                  <th className="py-3 px-4 font-medium">Counterparty Account</th>
                  <th className="py-3 px-4 font-medium text-right">Settlement Total</th>
                  <th className="py-3 px-4 font-medium text-center">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Interactive Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {loading ? (
                  // Skeleton Rows
                  [1, 2, 3, 4].map((n) => (
                    <tr key={n}>
                      <td className="py-4 px-4">
                        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-3 w-40 bg-stone-200 rounded animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-3 w-16 bg-stone-200 rounded ml-auto animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="h-5 w-16 bg-stone-200 rounded mx-auto animate-pulse"></div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="h-6 w-20 bg-stone-200 rounded ml-auto animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : displayedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-stone-500">
                      No invoices currently match this filter.
                    </td>
                  </tr>
                ) : (
                  displayedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-stone-800 font-medium">
                        {inv.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-stone-900 tabular-nums">
                        {formatINR(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {inv.status === 'PAID' && (
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded border border-emerald-300 bg-emerald-50 text-emerald-800">
                            Settled
                          </span>
                        )}
                        {inv.status === 'CONFIRMED' && (
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded border border-stone-300 bg-stone-100 text-stone-800">
                            Confirmed
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded border border-amber-300 bg-amber-50 text-amber-900">
                            Overdue
                          </span>
                        )}
                        {inv.status === 'DRAFT' && (
                          <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded border border-stone-300 bg-stone-50 text-stone-600">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status === 'PAID' ? (
                          <span className="text-stone-400 text-[11px]">Reconciled</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSimulatePayment(inv.id)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded border border-stone-400 bg-white hover:bg-stone-100 text-stone-800 transition-colors"
                          >
                            Simulate Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. THE RECURRING SUBSCRIPTION ARCHITECTURE (EDITORIAL NARRATIVE) */}
      <section id="workflow" className="space-y-8 pt-4">
        <div className="border-b border-stone-300 pb-3">
          <h2 className="font-serif text-2xl font-normal text-stone-950">Lifecycle Architecture</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            How recurring contracts transition from price catalog to tax-compliant invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: 4 Disciplined Steps */}
          <div className="space-y-6">
            <div className="border border-stone-300 rounded-lg p-5 bg-white space-y-2">
              <div className="text-xs font-mono text-stone-500">STAGE 01</div>
              <h3 className="text-base font-semibold text-stone-950">Catalog and Variant Rules</h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Define software suites, modular add-ons, and edition variants. Attach billing intervals: daily sprints, weekly cohorts, calendar monthly, or annual commitments.
              </p>
            </div>

            <div className="border border-stone-300 rounded-lg p-5 bg-white space-y-2">
              <div className="text-xs font-mono text-stone-500">STAGE 02</div>
              <h3 className="text-base font-semibold text-stone-950">Quote to Active Subscription</h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Pre-populate proposal terms from reusable quotation templates. Subscriptions transition through Draft, Quotation Sent, and Confirmed states without duplicate manual entry.
              </p>
            </div>

            <div className="border border-stone-300 rounded-lg p-5 bg-white space-y-2">
              <div className="text-xs font-mono text-stone-500">STAGE 03</div>
              <h3 className="text-base font-semibold text-stone-950">Automated Billing Runs</h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                On each contract due date, the system verifies previous cycles to prevent double billing. Invoices generate with calculated line items, volume discount thresholds, and regional GST.
              </p>
            </div>

            <div className="border border-stone-300 rounded-lg p-5 bg-white space-y-2">
              <div className="text-xs font-mono text-stone-500">STAGE 04</div>
              <h3 className="text-base font-semibold text-stone-950">Settlement and Receivables</h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Record receipts against bank transfers, UPI transactions, or credit card clearances. Outstanding receivables update in real time with customer account history.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Technical Specification Sheet */}
          <div className="border border-stone-300 rounded-lg bg-white overflow-hidden sticky top-24">
            <div className="p-4 border-b border-stone-200 bg-stone-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">Contract Engine Rules</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Automated constraints enforced across all active plans.</p>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-600 bg-stone-50/50 w-1/3">Concurrency Guard</td>
                  <td className="py-3 px-4">Database row locks ensure no contract can be processed twice for the same billing date.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-600 bg-stone-50/50">Tax Rules</td>
                  <td className="py-3 px-4">State-wise GST engine calculates CGST (9%) + SGST (9%) or IGST (18%) automatically.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-600 bg-stone-50/50">Discount Limits</td>
                  <td className="py-3 px-4">Quantity thresholds, minimum spend constraints, and calendar expiry limits enforced at invoice creation.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-600 bg-stone-50/50">Receipt Generation</td>
                  <td className="py-3 px-4">Authoritative vector PDF receipts with full GST breakdown, tax invoice serials, and bank references.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-stone-600 bg-stone-50/50">Lifecycle Policies</td>
                  <td className="py-3 px-4">Contract controls for Auto-Close on End Date, Early Cancellation, Pausing, and Auto-Renewal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT PRICING & VOLUME CALCULATOR (ANTI-3-TIERS) */}
      <section id="pricing" className="space-y-6 pt-4">
        <div className="border-b border-stone-300 pb-3">
          <h2 className="font-serif text-2xl font-normal text-stone-950">Platform Fee Schedule</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Transparent, volume-scaled pricing without hidden seat tiers or arbitrary feature gating.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Volume Slider */}
          <div className="lg:col-span-7 border border-stone-300 rounded-lg p-6 bg-white space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="subscriber-slider" className="text-sm font-semibold text-stone-900">
                  Active Subscriptions Managed
                </label>
                <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
                  {subscriberCount} accounts
                </span>
              </div>
              <input
                id="subscriber-slider"
                type="range"
                min="25"
                max="1500"
                step="25"
                value={subscriberCount}
                onChange={(e) => setSubscriberCount(Number(e.target.value))}
                className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                <span>25 starter accounts</span>
                <span>500 growth</span>
                <span>1,500 enterprise scale</span>
              </div>
            </div>

            {/* Annual Billing Term Switch */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div>
                <div className="text-xs font-semibold text-stone-900">Billing Term</div>
                <div className="text-[11px] text-stone-500">Annual commitment reflects a 20% deduction.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAnnualBilling(false)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    !annualBilling
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setAnnualBilling(true)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    annualBilling
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  Annual (Save 20%)
                </button>
              </div>
            </div>

            {/* Everything Included List */}
            <div className="pt-4 border-t border-stone-200 text-xs text-stone-700 space-y-2">
              <div className="font-semibold text-stone-900">All capabilities included in every plan:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>&bull; Unlimited quotation templates</div>
                <div>&bull; Multi-tier variant pricing</div>
                <div>&bull; Automated billing schedule engine</div>
                <div>&bull; GST tax rules &amp; reverse charges</div>
                <div>&bull; Direct PDF receipt generator</div>
                <div>&bull; Customer self-service portal</div>
                <div>&bull; Role-based team access</div>
                <div>&bull; Raw data CSV &amp; JSON exports</div>
              </div>
            </div>
          </div>

          {/* Calculated Cost Breakdown Receipt */}
          <div className="lg:col-span-5 border border-stone-300 rounded-lg p-6 bg-stone-50 space-y-4">
            <div className="border-b border-stone-300 pb-3">
              <div className="text-xs font-mono text-stone-500 uppercase">Estimated Monthly Fee</div>
              <div className="text-3xl font-serif font-normal text-stone-950 mt-1 tabular-nums">
                {formatINR(totalBilled, { showDecimals: false })}
                <span className="text-xs font-sans text-stone-500 ml-1">/ month</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>Base Platform Capacity</span>
                <span className="font-mono tabular-nums">{formatINR(netPlatformFee)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Statutory GST (18%)</span>
                <span className="font-mono tabular-nums">{formatINR(gstAmount)}</span>
              </div>
              <div className="border-t border-stone-300 pt-2 flex justify-between font-semibold text-stone-950">
                <span>Net Total (Inclusive of Taxes)</span>
                <span className="font-mono tabular-nums">{formatINR(totalBilled)}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/auth/register"
                className="block w-full py-3 text-center rounded-lg bg-stone-950 hover:bg-stone-800 text-white font-medium text-xs transition-colors"
              >
                Provision Workspace Account
              </Link>
              <div className="text-center text-[10px] text-stone-500 mt-2">
                Includes 14 days of full functionality with pre-loaded demo records.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRE-CONFIGURED ROLE SESSIONS */}
      <section className="space-y-4 pt-4 border-t border-stone-300">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="font-serif text-2xl font-normal text-stone-950">Verified Role Walkthroughs</h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Authenticate directly as one of three pre-seeded persona profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/auth/login"
            className="border border-stone-300 rounded-lg p-5 bg-white hover:border-stone-500 transition-colors block text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-stone-950">Elena Rostova</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 bg-stone-100 text-stone-700">
                Administrator
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Manages automated billing days, configures regional GST rules, defines volume discount bounds, and manages staff members.
            </p>
          </Link>

          <Link
            href="/auth/login"
            className="border border-stone-300 rounded-lg p-5 bg-white hover:border-stone-500 transition-colors block text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-stone-950">Sarah Jenkins</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 bg-stone-100 text-stone-700">
                Billing Staff
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Builds proposals from quotation templates, moves contracts from Draft to Confirmed, and records manual payment settlements.
            </p>
          </Link>

          <Link
            href="/auth/login"
            className="border border-stone-300 rounded-lg p-5 bg-white hover:border-stone-500 transition-colors block text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-stone-950">Alex Lindqvist</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-300 bg-stone-100 text-stone-700">
                Customer
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Self-service customer portal. Accesses subscribed seat counts, tracks renewal dates, and downloads official tax invoice receipts.
            </p>
          </Link>
        </div>
      </section>

      {/* 6. STATUTORY COMPLIANCE & EXPORTS */}
      <section className="border border-stone-300 rounded-lg p-6 bg-white space-y-4">
        <h3 className="font-serif text-xl font-normal text-stone-950">Statutory and Regulatory Adherence</h3>
        <p className="text-xs text-stone-700 leading-relaxed">
          Brightloop recurring software conforms to the GST Invoice Rules under the Central Goods and Services Tax Act, 2017. All generated invoices preserve consecutive alphanumeric serial numbering, mandatory HSN/SAC classifications, supplier GSTIN credentials, and itemized tax breakdowns.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-600 pt-2 border-t border-stone-200">
          <Link href="/terms" className="hover:text-stone-950 transition-colors">
            Terms of Service
          </Link>
          <span className="text-stone-300">&bull;</span>
          <Link href="/privacy" className="hover:text-stone-950 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-stone-300">&bull;</span>
          <Link href="/auth/login" className="hover:text-stone-950 transition-colors">
            System Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
