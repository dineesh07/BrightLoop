import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service: Brightloop Software',
  description: 'Terms of Service governing the use of Brightloop recurring billing and subscription management platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
      <div className="mb-8 border-b border-stone-200 pb-6">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 mb-3 inline-block">
          &larr; Return to Home
        </Link>
        <h1 className="text-3xl font-serif font-semibold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-2">Effective Date: October 31, 2026. Version 2.1</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Brightloop platform, APIs, or software services provided by Brightloop Software Inc. ("Brightloop", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you are entering into these terms on behalf of a company or legal entity, you represent that you possess the requisite authority to bind such entity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">2. Scope of Service and Platform Capabilities</h2>
          <p>
            Brightloop provides cloud-hosted software for subscription lifecycle management, quote-to-contract generation, recurring billing schedule calculation, Goods and Services Tax (GST) estimation, and accounts receivable tracking. We do not act as a licensed banking entity; payment settlements are routed through authorized Reserve Bank of India (RBI) payment gateways and merchant acquirers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">3. Account Integrity and Access Credentials</h2>
          <p>
            You are responsible for safeguarding login credentials, two-factor authentication tokens, and API secret keys. Any activity originating under authenticated role sessions (Administrator, Staff, or Customer) shall be deemed authorized by the account holder. You agree to notify Brightloop immediately upon detecting unauthorized credential usage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">4. Subscriptions, Invoicing, and Taxes</h2>
          <p>
            Subscription billing schedules operate on defined calendar intervals (daily, weekly, monthly, or yearly). Invoices generated through the automated billing engine reflect current configured tax rules, regional GST percentages (CGST, SGST, IGST), and active discount codes. You are solely responsible for ensuring tax rates match your statutory jurisdiction requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">5. Payment Settlement and Chargebacks</h2>
          <p>
            Fees billed for platform usage are non-refundable once an invoice cycle commences, except where required by applicable consumer law. Failure to settle invoices by the designated due date may trigger automated dunning protocols or suspension of contract execution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">6. Data Ownership and Export</h2>
          <p>
            You retain all right, title, and interest in your customer records, catalog items, pricing rules, and ledger histories. Brightloop grants you the continuous right to export raw invoice registers, payment receipts, and contract telemetry in standard JSON and CSV formats at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Brightloop Software Inc. shall not be liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenues resulting from service interruptions or third-party gateway downtime.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">8. Governing Law and Dispute Resolution</h2>
          <p>
            These terms are governed by and construed under the laws of the Republic of India. Any legal dispute or proceeding arising out of or related to these terms shall be submitted to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
          </p>
        </section>
      </div>
    </div>
  );
}
