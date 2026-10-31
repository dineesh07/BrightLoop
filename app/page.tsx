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

// Seed data baseline
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

// Worst-case data for break-ui stress testing
const WORST_CASE_DATA: PreviewData = {
  activeSubscriptions: 0,
  revenueCollected: 124567890.5,
  outstandingAmount: 98765432.0,
  invoices: [
    {
      id: 'inv-worst-1',
      invoiceNumber: 'INV-2026-999999999999',
      customerName: 'Aleksandra Wiśniewska-Kowalczyk von Hohenstaufen International Enterprise Group',
      amount: 98765432.0,
      status: 'OVERDUE',
    },
    {
      id: 'inv-worst-2',
      invoiceNumber: 'INV-2026-999999999998',
      customerName: 'M',
      amount: 0.5,
      status: 'PAID',
    },
    {
      id: 'inv-worst-3',
      invoiceNumber: 'INV-2026-999999999997',
      customerName: 'شركة البناء الدولية لخدمات التقنية المحدودة (RTL Name Test)',
      amount: 15420000.0,
      status: 'CONFIRMED',
    },
    {
      id: 'inv-worst-4',
      invoiceNumber: 'INV-2026-999999999996',
      customerName: 'Specialist Logistics & Heavy Freight Correlated Add-on Solutions',
      amount: 4500000.0,
      status: 'PAID',
    },
  ],
};

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [dataMode, setDataMode] = useState<'DEMO' | 'WORST_CASE'>('DEMO');
  const [previewData, setPreviewData] = useState<PreviewData>(SEED_FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/preview')
      .then((res) => (res.ok ? res.json() : SEED_FALLBACK))
      .then((data: PreviewData) => {
        if (data && typeof data.activeSubscriptions === 'number') {
          setPreviewData(data);
        }
        setLoaded(true);
      })
      .catch(() => {
        setPreviewData(SEED_FALLBACK);
        setLoaded(true);
      });
  }, []);

  const activeData = dataMode === 'WORST_CASE' ? WORST_CASE_DATA : previewData;
  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.8 : 1.0;

  return (
    <div className="space-y-20 py-4 sm:py-8 overflow-hidden">
      {/* 1. HERO SECTION (Compact spacing: fits headline, CTAs and product preview in first viewport) */}
      <section className="text-center max-w-5xl mx-auto px-4 space-y-6">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          <span>Recurring Billing &amp; Invoicing in ₹ INR</span>
          <span className="text-slate-400">→</span>
        </div>

        {/* Hero Headline: max 2 lines at desktop, tracking-tight, line-height ~1.05, weight 600 */}
        <div className="space-y-3">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-tight text-slate-900 leading-[1.05] [text-wrap:balance]">
            Recurring billing and subscriptions, <span className="text-indigo-600">simplified.</span>
          </h1>
          <p className="text-[18px] text-slate-600 max-w-[60ch] mx-auto leading-relaxed font-normal">
            Run your entire subscription workflow in one place. Set up plans, turn quotes into subscriptions, generate accurate invoices with GST, collect payments, and track revenue.
          </p>
        </div>

        {/* Hero CTAs: Clean, unbadged, 12px radius, 100-150ms press feedback */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm press-feedback shadow-subtle flex items-center justify-center"
          >
            Open Workspace
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 press-feedback flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* 2. REAL PRODUCT PREVIEW (Coded Mini Dashboard: active subscriptions, revenue collected, outstanding amount, 4 invoice rows) */}
        <div id="preview" className="pt-4 text-left">
          <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-card overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="text-xs text-slate-500 font-medium ml-2">Brightloop &bull; Billing Overview</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Break-UI Stress Test Toggle */}
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDataMode('DEMO')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      dataMode === 'DEMO' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Live Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setDataMode('WORST_CASE')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      dataMode === 'WORST_CASE' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Adversarial stress-test: long customer names, extreme numbers, zero counts"
                  >
                    Stress Test (break-ui)
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border-b border-slate-100 bg-white">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Active Subscriptions</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {activeData.activeSubscriptions}
                </div>
                <div className="text-xs text-slate-500 mt-1">Currently billing</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Revenue Collected</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums truncate">
                  {formatINR(activeData.revenueCollected, { showDecimals: false })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Settled payments</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Outstanding Invoices</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums truncate">
                  {formatINR(activeData.outstandingAmount, { showDecimals: false })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Awaiting settlement</div>
              </div>
            </div>

            {/* Invoices Table: 4 rows with Paid / Confirmed / Overdue pills */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-medium">
                    <th className="py-3 px-4 font-medium">Invoice Number</th>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium text-right">Amount (₹)</th>
                    <th className="py-3 px-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeData.invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[240px] truncate" title={inv.customerName}>
                        {inv.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium tabular-nums text-slate-900 whitespace-nowrap">
                        {formatINR(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {inv.status === 'PAID' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Paid
                          </span>
                        )}
                        {inv.status === 'CONFIRMED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            Confirmed
                          </span>
                        )}
                        {inv.status === 'OVERDUE' && (
                          /* Orange strictly reserved for overdue warning */
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Overdue
                          </span>
                        )}
                        {inv.status === 'DRAFT' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WORKFLOW: The Complete Billing Month Flow */}
      <section id="workflow" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">The Lifecycle</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            How a billing month runs in Brightloop
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            From product creation to collecting cash, every step is automated without spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
              01
            </div>
            <h3 className="text-base font-semibold text-slate-900">Products &amp; Plans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define software products with custom brand variants. Set daily, weekly, monthly, or yearly billing intervals with minimum quantities.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
              02
            </div>
            <h3 className="text-base font-semibold text-slate-900">Quotes to Contracts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start sales proposals from reusable quotation templates. Move from Draft to Quotation to Confirmed and Active contracts in one click.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
              03
            </div>
            <h3 className="text-base font-semibold text-slate-900">Automated Billing Day</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When subscriptions are due, invoices generate automatically with customer lines, GST tax calculations, and volume discounts applied.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs">
              04
            </div>
            <h3 className="text-base font-semibold text-slate-900">Payments &amp; Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record UPI, NEFT, and card payments against invoices. Track active subscriptions, cash collected, and overdue receivables instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM CAPABILITIES (Clean 20px radius cards, semi-transparent borders, no heavy shadows) */}
      <section id="features" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Features</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Built for reliability and operational control
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Everything your finance and operations team needs to manage subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Guaranteed Single Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subscriptions due on the same date are processed safely. Existing billing cycles are checked to guarantee no contract is billed twice or skipped.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Automated GST &amp; Discounts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tax rules apply automatically based on customer geography. Volume discount rules calculate percentage or fixed deductions and cease once expired.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Customer Self-Service Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customers log in to view their active subscriptions, download official GST PDF invoices, manage auto-renewal, and review payment history.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICING IN ₹ INR */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Pricing</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Transparent plans in Indian Rupees (₹)
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Choose the tier suited for your current volume. All plans include GST invoicing and email dispatch.
          </p>

          {/* Billing Frequency Toggle */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <span className={`text-xs font-medium ${billingCycle === 'MONTHLY' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
              className="w-11 h-6 rounded-full bg-indigo-600 p-0.5 transition-colors relative press-feedback"
              aria-label="Toggle annual billing discount"
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'ANNUAL' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${billingCycle === 'ANNUAL' ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Starter */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-semibold text-sm text-slate-900">Starter</div>
              <div className="text-xs text-slate-500">For small shops and early-stage software companies.</div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                  {formatINR(Math.round(2499 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Up to 150 Active Subscriptions</li>
                <li className="flex items-center gap-2">✓ Daily, Weekly, Monthly Plans</li>
                <li className="flex items-center gap-2">✓ Automated GST PDF Invoices</li>
                <li className="flex items-center gap-2">✓ Customer Self-Service Portal</li>
              </ul>
            </div>
            <Link
              href="/auth/register"
              className="w-full py-2.5 text-center text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 press-feedback"
            >
              Get Started
            </Link>
          </div>

          {/* Growth */}
          <div className="p-6 rounded-[20px] bg-white border-2 border-indigo-600 shadow-card flex flex-col justify-between space-y-6 relative">
            <div className="space-y-4">
              <div className="font-semibold text-sm text-indigo-600">Growth</div>
              <div className="text-xs text-slate-500">Full automation for scaling recurring businesses.</div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                  {formatINR(Math.round(7999 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 pt-4 border-t border-indigo-100 font-medium">
                <li className="flex items-center gap-2 text-indigo-700">✓ Automated Idempotent Billing Day</li>
                <li className="flex items-center gap-2">✓ Up to 1,500 Active Subscriptions</li>
                <li className="flex items-center gap-2">✓ Product &amp; Brand Variants</li>
                <li className="flex items-center gap-2">✓ Quotation Templates</li>
                <li className="flex items-center gap-2">✓ Automated Discount Rules</li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-2.5 text-center text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl press-feedback shadow-subtle"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-semibold text-sm text-slate-900">Enterprise</div>
              <div className="text-xs text-slate-500">Dedicated capacity for large teams with custom contracts.</div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                  {formatINR(Math.round(24999 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ Unlimited Active Subscriptions</li>
                <li className="flex items-center gap-2">✓ Role-Based Access (Admin/Staff)</li>
                <li className="flex items-center gap-2">✓ Custom Variant Architecture</li>
                <li className="flex items-center gap-2">✓ Priority Support &amp; SLA</li>
              </ul>
            </div>
            <Link
              href="/auth/register"
              className="w-full py-2.5 text-center text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 press-feedback"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ONE-CLICK DEMO PERSONAS (ONE Neutral Style for all three roles) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-[20px] bg-slate-900 text-white shadow-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Test with pre-configured demo personas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Explore the system with pre-seeded data across all three user roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/auth/login"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white">Elena Rostova</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">
                  Admin
                </span>
              </div>
              <div className="text-xs text-slate-400">Controls billing runs, taxes, discount limits, and team access.</div>
            </Link>

            <Link
              href="/auth/login"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white">Sarah Jenkins</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">
                  Staff
                </span>
              </div>
              <div className="text-xs text-slate-400">Prepares quotations from templates and records incoming payments.</div>
            </Link>

            <Link
              href="/auth/login"
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white">Alex Lindqvist</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">
                  Customer
                </span>
              </div>
              <div className="text-xs text-slate-400">Self-service portal to view seats and download GST invoices.</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER CALL TO ACTION */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-4 pt-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Ready to manage your recurring billing?
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Start exploring plans, subscriptions, and automated invoicing with pre-loaded data.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm press-feedback shadow-subtle"
          >
            Open Workspace
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-xl bg-white text-slate-700 font-medium text-sm border border-slate-200 hover:bg-slate-50 press-feedback"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}
