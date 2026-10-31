import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy: Brightloop Software',
  description: 'Privacy Policy governing data collection, storage, and processing practices for Brightloop.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800">
      <div className="mb-8 border-b border-stone-200 pb-6">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 mb-3 inline-block">
          &larr; Return to Home
        </Link>
        <h1 className="text-3xl font-serif font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-2">Effective Date: October 31, 2026. Version 2.1</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">1. Information We Collect</h2>
          <p>
            Brightloop collects data required to execute recurring subscription operations and financial recordkeeping:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Account Identity:</strong> Administrator, staff, and customer names, verified corporate email addresses, encrypted password hashes, and assigned operational roles.</li>
            <li><strong>Billing and Invoicing Information:</strong> Legal company names, registered GSTIN identifiers, billing addresses, and payment transaction references. Full credit card numbers are never stored on Brightloop servers; card tokens are processed directly by PCI-DSS Level 1 compliant payment gateways.</li>
            <li><strong>Operational Telemetry:</strong> Subscription creation logs, invoice status transitions, and payment settlement confirmation timestamps.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">2. How We Use Collected Data</h2>
          <p>
            Collected data is utilized strictly for executing platform functions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Generating recurring invoice records and calculating applicable statutory GST rates.</li>
            <li>Sending authentic transaction notifications, billing summaries, and official PDF receipts.</li>
            <li>Enforcing session security and role-based permissions across admin and self-service customer portals.</li>
            <li>Providing audit trails for corporate accounting compliance and financial reconciliation.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">3. Data Sharing and Third Parties</h2>
          <p>
            We do not sell, rent, or trade customer information to marketing aggregators or advertising exchanges. Data is disclosed only to verified service providers essential to service delivery, including certified cloud infrastructure hosts, transactional email relays, and licensed payment processors operating under confidentiality agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">4. Data Security and Cryptographic Standards</h2>
          <p>
            All network communication is encrypted in transit via Transport Layer Security (TLS 1.3). Sensitive credentials and user tokens are secured using industry-standard bcrypt hashing and salted JSON Web Tokens. Database records are isolated behind multi-tenant tenant-level filtering and encrypted at rest.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">5. Data Retention and Erasure</h2>
          <p>
            Financial records, invoices, and payment receipts are retained for the statutory period mandated by Indian tax and accounting authorities (minimum 8 years). Non-financial telemetry and expired session logs are purged systematically. You may request account deletion or data portability by contacting our data protection officer.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">6. Contact Information</h2>
          <p>
            For privacy inquiries, audit verification requests, or data protection officer communications, please contact us at: <code>privacy@brightloop.io</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
