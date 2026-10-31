'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrightloopLogo } from '@/components/BrightloopLogo';
import { formatINR } from '@/lib/currency';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [activeTab, setActiveTab] = useState<'BILLING' | 'VARIANTS' | 'QUOTES' | 'TELEMETRY'>('BILLING');

  const discountMultiplier = billingCycle === 'ANNUAL' ? 0.8 : 1.0;

  return (
    <div className="space-y-24 py-6 md:py-12 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative text-center max-w-5xl mx-auto px-4 space-y-8 pt-6">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-brand/15 via-sunburst/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-border shadow-subtle text-xs font-semibold text-text hover:border-brand/40 transition-colors">
          <span className="w-2 h-2 rounded-full bg-sunburst animate-ping"></span>
          <span className="text-brand font-bold">New:</span>
          <span>Automated Billing Day &amp; GST Compliance in ₹ INR</span>
          <span className="text-muted">→</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text leading-[1.08]">
            Turn subscriptions into <br />
            <span className="bg-gradient-to-r from-brand via-brand to-sunburst bg-clip-text text-transparent">
              predictable recurring revenue.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted leading-relaxed font-normal">
            The unified platform that runs the full life of a recurring subscription business. 
            From Odoo brand variants and quote-to-contract, to automated billing day and sub-2s INR telemetry.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-brand hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Live Console</span>
            <span className="bg-sunburst px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider text-white">
              ₹ INR
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-raised text-text font-bold text-sm border border-border shadow-subtle hover:border-brand/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Sign in to Workspace</span>
            <span className="text-muted text-xs">→</span>
          </Link>
        </div>

        {/* Quick Micro-Proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted pt-2">
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Idempotent Billing Runs</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Sub-20ms Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Nodemailer + GST Ready</span>
          </div>
        </div>

        {/* 2. HERO PRODUCT INTERFACE SHOWCASE (Realistic App Frame) */}
        <div className="pt-6">
          <div className="rounded-2xl border border-border bg-white shadow-2xl p-2 sm:p-3 relative overflow-hidden">
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-raised/50 rounded-t-xl mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                <span className="text-[11px] font-mono text-muted ml-2">brightloop.internal/telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand text-white">
                  Live Engine
                </span>
              </div>
            </div>

            {/* Mock Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 text-left">
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand-light to-white border border-brand/20">
                <div className="text-[11px] font-bold text-brand uppercase tracking-wider">Monthly Recurring (MRR)</div>
                <div className="text-2xl font-black text-text mt-1">₹14,50,000</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +18.4% this quarter</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border">
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Annual Run Rate (ARR)</div>
                <div className="text-2xl font-black text-text mt-1">₹1.74 Cr</div>
                <div className="text-[11px] text-muted mt-1">Normalized contract value</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border">
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Automated Billing</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
                <div className="text-[11px] text-muted mt-1">Zero missed renewals</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border">
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Engine Latency</div>
                <div className="text-2xl font-black text-brand mt-1">12ms</div>
                <div className="text-[11px] text-muted mt-1">Neon Serverless SQL</div>
              </div>
            </div>

            {/* Mock Ledger Preview */}
            <div className="p-3 text-left overflow-x-auto">
              <table className="ledger-table text-xs">
                <thead>
                  <tr>
                    <th>Contract / ID</th>
                    <th>Customer</th>
                    <th>Plan &amp; Variant</th>
                    <th className="text-right">Amount (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-brand font-bold">SUB-2026-0042</td>
                    <td className="font-semibold text-text">Nordic Retail AB</td>
                    <td>Business ERP Suite <span className="text-[10px] px-1.5 py-0.5 rounded bg-sunburst-light text-sunburst font-bold">+₹560 Odoo</span></td>
                    <td className="text-right font-bold text-text">₹25,560.00</td>
                    <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono text-brand font-bold">SUB-2026-0043</td>
                    <td className="font-semibold text-text">Apex Logistics Global</td>
                    <td>Enterprise Cloud HA (Quarterly)</td>
                    <td className="text-right font-bold text-text">₹1,44,000.00</td>
                    <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono text-brand font-bold">SUB-2026-0044</td>
                    <td className="font-semibold text-text">Studio Kraft Design</td>
                    <td>Analytics Engine + Support Bundle</td>
                    <td className="text-right font-bold text-text">₹49,990.00</td>
                    <td><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">RENEWING</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BEFORE VS AFTER COMPARISON */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold text-brand uppercase tracking-widest">The Transformation</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            How subscription businesses run today vs. with Brightloop
          </p>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Say goodbye to scattered renewal spreadsheets, missed billing cycles, and manual bank scrolling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today / Pain */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-5 relative">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>How things run today (Broken)</span>
            </div>

            <ul className="space-y-4 text-xs text-slate-700">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <div>
                  <strong>Customer Subscriptions:</strong> Tracked across disjointed spreadsheets that fall out of sync the moment a seat changes.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <div>
                  <strong>Renewals:</strong> Remembered by whoever notices first. Contract expiries slip through the cracks, leaking recurring cash.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <div>
                  <strong>Invoices &amp; Taxes:</strong> Typed up by hand every month. Taxes and volume discounts calculated manually with frequent errors.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <div>
                  <strong>Payments &amp; Collections:</strong> Matched to invoices by scrolling through PDF bank statements and UPI receipts.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <div>
                  <strong>Revenue Reporting:</strong> Takes days at the end of each quarter to compile MRR, ARR, and churn metrics.
                </div>
              </li>
            </ul>
          </div>

          {/* With Brightloop */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-brand/5 via-white to-sunburst/5 border border-brand/30 shadow-card space-y-5 relative">
            <div className="flex items-center gap-2 text-brand font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-brand inline-block animate-pulse"></span>
              <span>With Brightloop Platform (Automated)</span>
            </div>

            <ul className="space-y-4 text-xs text-text">
              <li className="flex items-start gap-3">
                <span className="text-brand font-bold">✓</span>
                <div>
                  <strong>Unified Lifecycle Engine:</strong> From draft quotes to confirmed, active, and paused contracts with automated transitions.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand font-bold">✓</span>
                <div>
                  <strong>Idempotent Billing Day:</strong> Hundreds of subscriptions billed simultaneously. Guaranteed zero double-billing and zero skips.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand font-bold">✓</span>
                <div>
                  <strong>Automated GST &amp; Discounts:</strong> Rules-based engine applies coupon caps, volume tiers, and CGST/SGST/IGST automatically.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand font-bold">✓</span>
                <div>
                  <strong>Multi-Method Collections:</strong> Record UPI, IMPS, NEFT, NetBanking, and cards with instant invoice reconciliation.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand font-bold">✓</span>
                <div>
                  <strong>Sub-2-Second Finance Telemetry:</strong> Instant executive dashboard calculating MRR, ARR, and aging overdue queues in under 20ms.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. CORE ARCHITECTURE & FEATURES (BENTO GRID) */}
      <section id="features" className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-brand uppercase tracking-widest">Platform Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Engineered for every day of the billing month
          </p>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Brightloop handles the nuanced edges of real-world subscriptions that basic payment gateways ignore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Billing Day Engine */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center font-bold">
              ⚡
            </div>
            <h3 className="text-base font-bold text-text">Idempotent Billing Day</h3>
            <p className="text-xs text-muted leading-relaxed">
              When hundreds of subscriptions come due at once, Brightloop validates existing cycles to guarantee nothing is billed twice or skipped, auto-advancing next billing dates.
            </p>
          </div>

          {/* Card 2: Brand Variants */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sunburst-light text-sunburst flex items-center justify-center font-bold">
              🏷️
            </div>
            <h3 className="text-base font-bold text-text">Product &amp; Brand Variants</h3>
            <p className="text-xs text-muted leading-relaxed">
              Define software products with flexible variants. For example, selecting the <strong>Odoo Brand Edition</strong> automatically adds ₹560 to base contract lines.
            </p>
          </div>

          {/* Card 3: Quotation Templates */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              📋
            </div>
            <h3 className="text-base font-bold text-text">Quote to Subscription in 1 Click</h3>
            <p className="text-xs text-muted leading-relaxed">
              Sales reps instantiate ready-to-sign offers from pre-configured quotation templates valid for 14 to 30 days, pre-filling lines, taxes, and payment terms.
            </p>
          </div>

          {/* Card 4: Automated Discounts */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🎟️
            </div>
            <h3 className="text-base font-bold text-text">Automated Discount Rules</h3>
            <p className="text-xs text-muted leading-relaxed">
              Set fixed amount or percentage discounts triggered by minimum seats or purchase values. Automatically applies to eligible invoices and ceases once expired or exhausted.
            </p>
          </div>

          {/* Card 5: Customer Portal */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              👤
            </div>
            <h3 className="text-base font-bold text-text">Self-Service Customer Portal</h3>
            <p className="text-xs text-muted leading-relaxed">
              Clients access their own dedicated portal to inspect contract lines, download itemized GST tax invoices, pause or close contracts early (when enabled by plan), and pay online.
            </p>
          </div>

          {/* Card 6: Sub-2s Telemetry */}
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card hover:shadow-card-hover transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              📊
            </div>
            <h3 className="text-base font-bold text-text">Sub-2s Query Telemetry</h3>
            <p className="text-xs text-muted leading-relaxed">
              With thousands of contracts on the books, every dashboard aggregate executes in under 20 milliseconds, providing real-time MRR, ARR, and overdue receivables.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION IN ₹ INR */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-brand uppercase tracking-widest">Transparent Pricing</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Simple plans tailored in Indian Rupees (₹)
          </p>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Choose the tier that matches your monthly recurring volume. All plans include automated GST invoicing.
          </p>

          {/* Billing Frequency Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-bold ${billingCycle === 'MONTHLY' ? 'text-text' : 'text-muted'}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
              className="w-12 h-6 rounded-full bg-brand p-0.5 transition-colors relative"
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'ANNUAL' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingCycle === 'ANNUAL' ? 'text-text' : 'text-muted'}`}>Annual</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sunburst text-white">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Starter */}
          <div className="p-8 rounded-2xl bg-white border border-border shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-bold text-sm text-text">Starter Business</div>
              <div className="text-xs text-muted">For boutique firms and early-stage software companies.</div>
              <div className="pt-2">
                <span className="text-4xl font-black text-text">
                  {formatINR(Math.round(2499 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-muted ml-1.5">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-rule">
                <li className="flex items-center gap-2"><span>✓</span> Up to 150 Active Subscriptions</li>
                <li className="flex items-center gap-2"><span>✓</span> Daily, Weekly &amp; Monthly Plans</li>
                <li className="flex items-center gap-2"><span>✓</span> GST Tax Rules &amp; PDF Invoices</li>
                <li className="flex items-center gap-2"><span>✓</span> Self-Service Customer Portal</li>
                <li className="flex items-center gap-2"><span>✓</span> Nodemailer Email Notifications</li>
              </ul>
            </div>
            <Link
              href="/auth/register"
              className="w-full py-2.5 text-center text-xs font-bold bg-raised hover:bg-brand-light text-text hover:text-brand rounded-xl border border-border transition-all"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Tier 2: Pro Growth (Featured) */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-brand/5 via-white to-white border-2 border-brand shadow-xl relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="font-bold text-sm text-brand">Growth Operating System</div>
              <div className="text-xs text-muted">Full automation for scaleups running recurring volume.</div>
              <div className="pt-2">
                <span className="text-4xl font-black text-text">
                  {formatINR(Math.round(7999 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-muted ml-1.5">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 pt-4 border-t border-brand/10 font-medium">
                <li className="flex items-center gap-2 text-brand"><span>✓</span> <strong>Automated Idempotent Billing Day</strong></li>
                <li className="flex items-center gap-2"><span>✓</span> Up to 1,500 Active Subscriptions</li>
                <li className="flex items-center gap-2"><span>✓</span> Product &amp; Brand Variants (Odoo +₹560)</li>
                <li className="flex items-center gap-2"><span>✓</span> Quotation Templates Engine</li>
                <li className="flex items-center gap-2"><span>✓</span> Automated Discount Rules &amp; Limits</li>
                <li className="flex items-center gap-2"><span>✓</span> Sub-20ms Finance Telemetry</li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="w-full py-3 text-center text-xs font-extrabold bg-brand hover:bg-brand-hover text-white rounded-xl shadow-brand hover:scale-[1.02] transition-all"
            >
              Launch Live Platform
            </Link>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="p-8 rounded-2xl bg-white border border-border shadow-card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="font-bold text-sm text-text">Enterprise Scale</div>
              <div className="text-xs text-muted">Dedicated infrastructure for high-throughput enterprises.</div>
              <div className="pt-2">
                <span className="text-4xl font-black text-text">
                  {formatINR(Math.round(24999 * discountMultiplier), { showDecimals: false })}
                </span>
                <span className="text-xs text-muted ml-1.5">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-rule">
                <li className="flex items-center gap-2"><span>✓</span> Unlimited Active Subscriptions</li>
                <li className="flex items-center gap-2"><span>✓</span> Multi-Staff Role-Based Governance</li>
                <li className="flex items-center gap-2"><span>✓</span> Dedicated Neon PostgreSQL Connection</li>
                <li className="flex items-center gap-2"><span>✓</span> Custom Brand Variant Architectures</li>
                <li className="flex items-center gap-2"><span>✓</span> 99.99% Execution SLA &amp; Support</li>
              </ul>
            </div>
            <Link
              href="/auth/register"
              className="w-full py-2.5 text-center text-xs font-bold bg-raised hover:bg-brand-light text-text hover:text-brand rounded-xl border border-border transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 6. ONE-CLICK DEMO PERSONA SHOWCASE */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-dark-mesh text-white shadow-2xl relative overflow-hidden space-y-8">
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-sunburst">Try It Right Now</div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Experience the exact workflow with 3 pre-loaded personas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              No registration or setup needed. Switch roles with 1 click to test full Admin oversight, Sales Staff operations, and Customer self-service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/auth/login"
              className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Elena Rostova</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-brand text-white">ADMIN</span>
              </div>
              <div className="text-xs text-slate-300">Runs billing day, sets tax &amp; discount rules, monitors ₹ MRR telemetry.</div>
              <div className="text-[11px] text-brand-light group-hover:text-sunburst font-semibold mt-3">Sign in as Elena →</div>
            </Link>

            <Link
              href="/auth/login"
              className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Sarah Jenkins</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500 text-white">STAFF</span>
              </div>
              <div className="text-xs text-slate-300">Builds quotes from templates, activates contracts, and records UPI payments.</div>
              <div className="text-[11px] text-brand-light group-hover:text-sunburst font-semibold mt-3">Sign in as Sarah →</div>
            </Link>

            <Link
              href="/auth/login"
              className="p-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Alex Lindqvist</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white">CLIENT</span>
              </div>
              <div className="text-xs text-slate-300">Self-service portal: downloads GST invoices, reviews seats, settles online.</div>
              <div className="text-[11px] text-brand-light group-hover:text-sunburst font-semibold mt-3">Sign in as Alex →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION FOOTER BANNER */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6 pt-6">
        <BrightloopLogo size="lg" showText={true} className="justify-center" />
        <h2 className="text-3xl sm:text-5xl font-black text-text tracking-tight">
          Ready to automate your recurring revenue in ₹ INR?
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto">
          Start in 2 minutes. Pre-configured with Neon PostgreSQL, Nodemailer transactional templates, and idempotent billing runs.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-brand hover:scale-[1.02] transition-all"
          >
            Launch Console Now
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3.5 rounded-xl bg-white text-text font-bold text-sm border border-border hover:bg-raised transition-all"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
