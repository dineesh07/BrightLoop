# Brightloop Software — Subscription Management & Recurring Billing Platform

A unified, modern enterprise platform built for **Brightloop Software** to manage the complete lifecycle of a recurring subscription business: from configuring products, brand variants, and plans, to sales quotation generation, automated billing day execution, tax and discount rules, multi-method payment recording, transactional emails via Nodemailer, and sub-2-second finance analytics.

Powered by **Next.js 14**, **TypeScript**, **Neon Serverless PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **Nodemailer**.

---

## 🚀 Live Demo & Persona Switcher

The top navigation bar contains a **1-click Role Demo Switcher** allowing instant testing across all three user personas:

| Persona | Role | Credentials | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | `ADMIN` | `admin@brightloop.com` / `Admin@12345!` | Full platform control: manage staff, set tax rules, discount rules, products & brand variants, plans, and financial reports. |
| **Sarah Jenkins** | `STAFF` | `sarah.sales@brightloop.com` / `Staff@12345!` | Day-to-day operations: instantiate quotes from templates, confirm subscriptions, execute Billing Day runs, and record invoice payments. |
| **Alex Lindqvist** | `CUSTOMER` | `alex@nordicretail.com` / `Customer@12345!` | Self-service portal: view personal subscriptions, contract lines, renewal status, pause/cancel early (when permitted by plan), and pay invoices online. |

---

## ✨ Key Features & Enhancements

- **🐘 Neon Serverless PostgreSQL**: Native support for Neon connection pooling (`DATABASE_URL` with `pgbouncer=true`) for high-concurrency serverless queries, along with `DIRECT_URL` for Prisma migrations and schema push.
- **✉️ Transactional Email with Nodemailer**: Production-grade email dispatches with responsive HTML templates for password resets, invoices, and customer registration. Seamless fallback transport ensures local dev and tests run without requiring live SMTP credentials.
- **🎨 Vibrant SaaS Design System**: Modern, high-conversion visual design inspired by Stripe, Linear, and Vercel. Rich slate canvas (`#f8fafc`), crisp card borders, obsidian typography, radiant electric blue accents (`#2563eb`), and status badges with indicator dots.
- **🔐 Redesigned Auth Experience**: Split-screen SaaS authentication interface highlighting Brightloop core capabilities, social proof, one-click persona autofill, password visibility toggle, and real-time security requirement validation.

---

## 📖 Walkthrough of "A Month at Brightloop"

### Scene 1: A New Customer Signs Up
- **Self-Service Registration** (`/auth/register`):
  - Strictly validates password criteria: **more than 8 characters**, with **at least one uppercase letter**, **one lowercase letter**, and **one special character**.
  - Enforces email address uniqueness.
  - Sends a branded welcome email via Nodemailer.
- **Forgot Password Recovery** (`/auth/forgot-password` and `/auth/reset-password`):
  - Generates secure cryptographic reset tokens with 1-hour expiry and dispatches recovery emails via Nodemailer.
- **Role-Based Access Control (RBAC)**:
  - Admin controls the entire system.
  - Internal staff handle quotes, subscriptions, billing, and payments with limited access (cannot modify taxes/discounts or invite staff).
  - Customers see only their own subscriptions and invoices through the dedicated customer portal (`/portal`).
  - **Only the Admin can add new staff members** (`/staff`).

### Scene 2: Launching a New Plan
- **Products & Variants** (`/products`):
  - Products include: Name, type (`SOFTWARE`, `SERVICE`, `ADDON`, `MODULE`), sales price, cost price, and notes.
  - Multi-variant configuration: e.g. **Odoo Brand Edition adds $560 to base price**, Standard Edition adds $0, Enterprise Cloud adds $250.
- **Plans & Frequencies** (`/plans`):
  - Billing intervals: **Daily**, **Weekly**, **Monthly**, or **Yearly**.
  - Minimum quantities (e.g. min 5 or 10 seats).
  - Availability date ranges.
  - Granular lifecycle toggles: **Auto-close on end date**, **Allow early close**, **Allow pause**, and **Allow renewal**.

### Scene 3: Turning a Quote into a Subscription
- **Quotation Templates** (`/templates`):
  - Sales reps start from pre-configured packages (e.g. *Enterprise Logistics Package* or *Growth Operations Bundle*) valid for 14 to 30 days.
  - One-click instantiation pre-populates product lines, quantities, and variants.
- **Subscription Lifecycle** (`/subscriptions` and `/subscriptions/[id]`):
  - Unique subscription number sequence (e.g. `SUB-2026-0001`).
  - Customer details, plan, start date, expiry date, payment terms (`Immediate`, `Net 15`, `Net 30`, `Net 60`).
  - Status progression: `DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `PAUSED` → `CLOSED`.

### Scene 4: Billing Day
- **Billing Command Center** (`/billing`):
  - Detects all active subscriptions due for billing (`nextBillingDate <= today`).
  - **Idempotent Execution**: Checks for existing invoices generated for the current cycle to guarantee that **nothing is billed twice or skipped**.
  - Automatically advances `nextBillingDate` based on the plan interval (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`).
  - Auto-closes expiring contracts if `autoCloseOnEnd` is enabled.
  - Audit trail stored in `BillingLog` with execution timestamps, counts, and amounts.
- **Invoice Document & Actions** (`/invoices` and `/invoices/[id]`):
  - Itemized product lines, variants, unit prices, taxes, and applied discounts.
  - Status lifecycle: `DRAFT` → `CONFIRMED` → `PAID` (or `CANCELLED`).
  - Actions: **Confirm**, **Cancel**, **Send** (dispatches styled HTML invoice to customer via Nodemailer), and **Print/PDF** layout.

### Scene 5: A Customer Asks for a Better Price
- **Admin Discount Rules** (`/discounts`):
  - Fixed amount or percentage off (e.g. 10% volume discount, $150 enterprise discount, 15% Odoo concession).
  - Minimum purchase spend or minimum seat quantity triggers.
  - Start and end validity dates.
  - Maximum usage limits and automatic usage count tracking.
  - Scope: can target **Whole Subscription** or **Specific Products**.
  - **Auto-Application**: The billing engine automatically calculates and deducts eligible discounts during invoice generation without manual intervention, and stops when expired or exhausted.

### Scene 6: The Money Comes In
- **Payment Recording** (`/invoices/[id]` or `/invoices`):
  - Supports multiple payment methods: `CREDIT_CARD`, `BANK_TRANSFER`, `STRIPE`, `DIRECT_DEBIT`, `CHECK`, `CASH`.
  - Records transaction reference, payment date, notes, and the recording staff member.
  - Automatic balance calculation: handles partial payments or full settlement.
  - Automatically marks invoices as `PAID` once the full balance is met.
  - Real-time tracking of paid vs outstanding vs overdue receivables.

### Scene 7: The Finance Lead, at the End of the Month
- **Executive Finance Dashboard** (`/`):
  - **Sub-2-Second Query Performance**: Parallel single-pass aggregates execute in **under 20 milliseconds** (tested at ~10ms).
  - **MRR (Monthly Recurring Revenue)** and **ARR (Annual Recurring Revenue)** normalized across daily, weekly, monthly, and yearly subscriptions.
  - Active subscriptions count and total contracts.
  - Total Cash Revenue Collected in bank.
  - Total Outstanding Receivables owed.
  - **Overdue Invoices Queue**: Instant highlight of invoices past their due date with 1-click payment recording.
  - **Recharts Visualizations**: Monthly revenue collection trend and subscription distribution by plan.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Neon Serverless PostgreSQL with Prisma ORM (supports connection pooling and direct migrations)
- **Emails**: Nodemailer with custom branded HTML templates and safe dev fallback transport
- **Styling**: Tailwind CSS configured with a modern, high-conversion SaaS palette
- **Auth**: Custom JWT session tokens with HTTP-only cookies, bcrypt hashing, and strict password security rules
- **Validation**: Shared Zod schemas across client and server
- **Charts**: Recharts with minimal chrome and tabular figures

---

## 💻 Getting Started Locally

```bash
# 1. Clone the repository and install dependencies
npm install

# 2. Configure environment variables in .env (copy from .env.example)
# Add your Neon PostgreSQL connection strings and SMTP credentials:
# DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require&pgbouncer=true"
# DIRECT_URL="postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require"

# 3. Generate Prisma client & push schema to Neon
npx prisma generate
npx prisma db push

# 4. Seed realistic Brightloop demo data
node prisma/seed.js

# 5. Build optimized production bundle
npm run build

# 6. Start the production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
