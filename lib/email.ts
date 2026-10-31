import nodemailer, { Transporter } from 'nodemailer';
import dns from 'dns';

// Ensure IPv4 is prioritized on Windows / Node 18+ to avoid IPv6 connection hangs with Gmail SMTP
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER;
  // Clean whitespace from app passwords (e.g. Google 16-character passwords)
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  } else {
    // Development fallback transport: logs email details safely without requiring live SMTP credentials
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
  }

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const client = getTransporter();
    const fallbackFrom = process.env.SMTP_USER
      ? `"Brightloop Software" <${process.env.SMTP_USER}>`
      : '"Brightloop Software" <billing@brightloop.com>';
    const fromAddress = process.env.EMAIL_FROM || fallbackFrom;

    const info = await client.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    console.log(`[Nodemailer] Email dispatched to ${to} (Subject: "${subject}") - MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer] Failed to send email to ${to}:`, error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Health check helper to verify SMTP transporter credentials and connectivity
 */
export async function verifyEmailConnection(): Promise<{ ok: boolean; message: string; details?: any }> {
  try {
    const client = getTransporter();
    await client.verify();
    return {
      ok: true,
      message: 'SMTP transporter verified successfully',
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.EMAIL_FROM,
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'SMTP verification failed',
      details: err,
    };
  }
}

/**
 * Resolves the canonical base URL for email links.
 * Prefers explicitly configured NEXT_PUBLIC_APP_URL, then Vercel production domain,
 * then Vercel deployment URL, falling back to localhost for local testing.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`;
  }
  return 'http://localhost:3000';
}

// 1. Password Reset Email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const baseUrl = getBaseUrl();
  const fullUrl = resetUrl.startsWith('http') ? resetUrl : `${baseUrl}${resetUrl}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
          .logo-dot { width: 10px; height: 10px; background: #5638F5; border-radius: 50%; display: inline-block; }
          h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
          .btn { display: inline-block; background: #5638F5; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; margin: 8px 0 24px; }
          .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
          .code { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">
            <span class="logo-dot"></span> Brightloop Software
          </div>
          <h1>Password Reset Request</h1>
          <p>We received a request to reset the password for your Brightloop account (<strong>${email}</strong>). Click the button below to choose a new password.</p>
          <a href="${fullUrl}" class="btn">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p class="code">${fullUrl}</p>
          <p>This password reset link is valid for 60 minutes. If you did not make this request, you can safely ignore this email.</p>
          <div class="footer">
            Brightloop Software — Recurring Billing & Plan Management Platform
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your Brightloop password',
    html,
  });
}

// 2. Invoice Dispatch Email
export async function sendInvoiceEmail(invoice: any, to: string) {
  const baseUrl = getBaseUrl();
  const invoiceUrl = `${baseUrl}/invoices/${invoice.id}`;
  const portalUrl = `${baseUrl}/portal`;
  const balanceDue = Math.max(0, invoice.grandTotal - invoice.amountPaid);

  const linesHtml = (invoice.lines || [])
    .map(
      (line: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
          ${line.description}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center; color: #64748b;">
          ${line.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">
          ₹${line.lineTotal.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #eff6ff; color: #1d4ed8; }
          h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { text-align: left; font-size: 12px; color: #64748b; font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
          .total-box { margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .btn { display: inline-block; background: #5638F5; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; margin: 20px 0 12px; }
          .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div class="logo" style="margin: 0;">Brightloop Software</div>
            <span class="badge">Invoice ${invoice.invoiceNumber}</span>
          </div>
          <h1>New Invoice Generated</h1>
          <p>Hello ${invoice.customer?.name || 'Customer'},</p>
          <p>Your subscription invoice for the current billing cycle is ready. Below is a breakdown of your items:</p>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${linesHtml}
            </tbody>
          </table>

          <div class="total-box">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 4px;">
              <span>Subtotal:</span>
              <span>₹${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.discountTotal > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #5638F5; margin-bottom: 4px;">
              <span>Discount Applied:</span>
              <span>-₹${invoice.discountTotal.toFixed(2)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
              <span>Taxes & GST:</span>
              <span>₹${invoice.taxTotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <span>Balance Due:</span>
              <span style="color: #dc2626;">₹${balanceDue.toFixed(2)}</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
              Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${invoiceUrl}" class="btn">View & Pay Invoice Online</a>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">
            You can also view all contracts and settle invoices anytime in your <a href="${portalUrl}" style="color: #5638F5;">Customer Portal</a>.
          </p>

          <div class="footer">
            Brightloop Software — Recurring Billing & Plan Management Engine
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${invoice.invoiceNumber} from Brightloop Software (₹${balanceDue.toFixed(2)} due)`,
    html,
  });
}

// 3. Customer Welcome Email (High-conversion branded SaaS welcome template)
export async function sendWelcomeEmail(to: string, name: string) {
  const baseUrl = getBaseUrl();
  const portalUrl = `${baseUrl}/portal`;
  const loginUrl = `${baseUrl}/auth/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Brightloop Software</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
          .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04); }
          h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }
          .feature-list { font-size: 14px; color: #475569; line-height: 1.7; padding-left: 20px; margin: 16px 0 24px; }
          .btn { display: inline-block; background-color: #5638F5; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(86, 56, 245, 0.25); }
          .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <!-- Branded Header with Infinity SVG -->
          <div style="margin-bottom: 24px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width: 38px; height: 38px; background-color: #5638F5; border-radius: 10px; text-align: center; vertical-align: middle;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;">
                    <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.739-8z" />
                  </svg>
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <span style="font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em;">Brightloop</span>
                </td>
              </tr>
            </table>
          </div>

          <h1>Welcome to Brightloop, ${name}!</h1>
          <p>Your subscription management and billing account has been set up successfully. We're excited to have you onboard.</p>

          <!-- Account Details Box -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #5638F5; margin-bottom: 10px;">
              Your Account Summary
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px;">
              <tr>
                <td style="color: #64748b; padding: 4px 0;">Account Holder:</td>
                <td style="color: #0f172a; font-weight: 600; text-align: right; padding: 4px 0;">${name}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 4px 0;">Registered Email:</td>
                <td style="color: #0f172a; font-weight: 600; text-align: right; padding: 4px 0;">${to}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 4px 0;">Portal Role:</td>
                <td style="color: #059669; font-weight: 600; text-align: right; padding: 4px 0;">Customer Self-Service</td>
              </tr>
            </table>
          </div>

          <p>Through your personal Customer Portal, you can conveniently manage everything in one place:</p>
          <ul class="feature-list">
            <li><strong>Subscription Management</strong>: Review active plans, configured product variants, seats, and add-on modules.</li>
            <li><strong>Automated Billing & Renewals</strong>: Monitor upcoming renewal dates, lifecycle triggers, and pause policies.</li>
            <li><strong>Invoices & Payment Receipts</strong>: Settle invoices online and download authentic PDF receipts instantly.</li>
          </ul>

          <div style="text-align: center; margin: 28px 0 20px;">
            <a href="${portalUrl}" class="btn">Launch Customer Portal &rarr;</a>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0 0 16px;">
            You can also log in anytime at <a href="${loginUrl}" style="color: #5638F5; text-decoration: none; font-weight: 500;">${loginUrl}</a>.
          </p>

          <div class="footer">
            <p style="margin: 0 0 6px;">Need assistance? Reply directly to this email or reach us at <a href="mailto:support@brightloop.com" style="color: #5638F5; text-decoration: none;">support@brightloop.com</a></p>
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">Brightloop Software &bull; Recurring Billing & Subscription Management Platform</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Brightloop Software — Your Account is Ready',
    html,
    text: `Welcome to Brightloop, ${name}!\n\nYour subscription management account has been created successfully.\nRegistered Email: ${to}\n\nAccess your Customer Portal: ${portalUrl}\nSign in: ${loginUrl}\n\nNeed assistance? Contact support@brightloop.com.`,
  });
}
