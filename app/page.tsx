'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Zap,
  Package,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  Layers,
  CreditCard,
  Users,
  Percent,
  CheckCircle2,
} from 'lucide-react';
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
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [previewData, setPreviewData] = useState<PreviewData>(SEED_FALLBACK);

  useEffect(() => {
    fetch('/api/preview')
      .then((res) => (res.ok ? res.json() : SEED_FALLBACK))
      .then((data: PreviewData) => {
        if (data && typeof data.activeSubscriptions === 'number') {
          setPreviewData(data);
        }
      })
      .catch(() => {
        setPreviewData(SEED_FALLBACK);
      });
  }, []);

  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.8 : 1.0;

  return (
    <div className="space-y-24 py-4 sm:py-8 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="text-center max-w-5xl mx-auto px-4 space-y-6">
        {/* Subtle Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          <span>Subscription Lifecycle &amp; Recurring Billing</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Hero Headline */}
        <div className="space-y-3">
          <h1 className="text-[clamp(2.5rem,5vw,4.25rem)] font-semibold tracking-tight text-slate-900 leading-[1.06] [text-wrap:balance]">
            Recurring billing and subscriptions, <span className="text-indigo-600">simplified.</span>
          </h1>
          <p className="text-[18px] text-slate-600 max-w-[60ch] mx-auto leading-relaxed font-normal">
            Run your entire subscription workflow in one place. Set up plans, turn quotes into subscriptions, generate accurate invoices with GST, collect payments, and track revenue.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm press-feedback shadow-subtle flex items-center justify-center gap-2"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 press-feedback flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        {/* 2. REAL PRODUCT PREVIEW DASHBOARD */}
        <div id="preview" className="pt-6 text-left">
          <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-card overflow-hidden">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span className="text-xs text-slate-500 font-medium ml-2">Brightloop &bull; Billing Overview</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 px-2.5 py-0.5 rounded-md bg-white border border-slate-200">
                Live Overview
              </span>
            </div>

            {/* 3 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-5 border-b border-slate-100 bg-white">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Active Subscriptions</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {previewData.activeSubscriptions}
                </div>
                <div className="text-xs text-slate-500 mt-1">Currently billing</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Revenue Collected</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums truncate">
                  {formatINR(previewData.revenueCollected, { showDecimals: false })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Settled payments</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="text-xs font-medium text-slate-500">Outstanding Invoices</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums truncate">
                  {formatINR(previewData.outstandingAmount, { showDecimals: false })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Awaiting settlement</div>
              </div>
            </div>

            {/* Invoices Table: 4 rows with Paid / Confirmed / Overdue status pills */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-medium">
                    <th className="py-3 px-4 sm:px-5 font-medium">Invoice Number</th>
                    <th className="py-3 px-4 sm:px-5 font-medium">Customer</th>
                    <th className="py-3 px-4 sm:px-5 font-medium text-right">Amount</th>
                    <th className="py-3 px-4 sm:px-5 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {previewData.invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-5 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 font-medium text-slate-800 max-w-[260px] truncate" title={inv.customerName}>
                        {inv.customerName}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-right font-medium tabular-nums text-slate-900 whitespace-nowrap">
                        {formatINR(inv.amount)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
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

      {/* 3. THE MONTHLY SUBSCRIPTION LIFECYCLE (WORKFLOW) */}
      <section id="workflow" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">The Lifecycle</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            How a billing month runs in Brightloop
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            From product creation to collecting payments, every step is automated without spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">1. Products &amp; Plans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define software products with custom brand variants. Set daily, weekly, monthly, or yearly intervals with minimum quantities.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">2. Quotes to Contracts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start sales proposals from reusable quotation templates. Move from Draft to Quotation to Confirmed and Active in one click.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">3. Automated Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When subscriptions are due, invoices generate automatically with customer lines, GST calculations, and volume discounts applied.
            </p>
          </div>

          <div className="p-5 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">4. Payments &amp; Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record UPI, NEFT, and card payments against invoices. Track active subscriptions, cash collected, and overdue receivables.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM CAPABILITIES */}
      <section id="features" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Capabilities</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Engineered for reliability and operational control
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Everything your finance and operations team needs to manage subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Guaranteed Single Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subscriptions due on the same date are processed safely. Existing cycles are verified to guarantee no contract is billed twice or skipped.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Automated GST &amp; Discounts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tax rules calculate automatically based on customer region. Volume discount rules calculate percentage or fixed deductions and cease once expired.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-white border border-slate-200/80 shadow-card space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Customer Self-Service Portal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Customers log in to view active contracts, download official GST PDF invoices, manage auto-renewal, and review past payment history.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Pricing</h2>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Transparent plans for every scale
          </p>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Choose the tier suited for your current volume. All plans include automated invoicing and email delivery.
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
              <div className="text-xs text-slate-500">For boutique businesses and growing teams.</div>
              <div className="pt-2">
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">
                  {formatINR(Math.round(2499 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Up to 150 Active Subscriptions</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Daily, Weekly &amp; Monthly Plans</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Automated GST Invoicing</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Customer Self-Service Portal</li>
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
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-indigo-100 font-medium">
                <li className="flex items-center gap-2 text-indigo-700"><Check className="w-3.5 h-3.5 text-indigo-600" /> Automated Billing Runs</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Up to 1,500 Active Subscriptions</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Product &amp; Brand Variants</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Quotation Templates</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Automated Discount Rules</li>
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
              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Unlimited Active Subscriptions</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Role-Based Access (Admin/Staff)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Custom Product Variants</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-600" /> Priority Support &amp; SLA</li>
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

      {/* 6. ONE-CLICK DEMO PERSONAS */}
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
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm press-feedback shadow-subtle flex items-center gap-2"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
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
