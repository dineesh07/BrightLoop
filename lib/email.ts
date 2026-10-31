import nodemailer, { Transporter } from 'nodemailer';

// Configure SMTP transport with environment variables or safe development fallback
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const emailFrom = process.env.EMAIL_FROM || '"Brightloop Software" <billing@brightloop.com>';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
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
    const info = await client.sendMail({
      from: emailFrom,
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

// 1. Password Reset Email
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const fullUrl = resetUrl.startsWith('http') ? resetUrl : `http://localhost:3000${resetUrl}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
          .logo-dot { width: 10px; height: 10px; background: #2563eb; border-radius: 50%; display: inline-block; }
          h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; margin: 8px 0 24px; }
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
  const invoiceUrl = `http://localhost:3000/invoices/${invoice.id}`;
  const portalUrl = `http://localhost:3000/portal`;
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
          $${line.lineTotal.toFixed(2)}
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
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; margin: 20px 0 12px; }
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
              <span>$${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.discountTotal > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #2563eb; margin-bottom: 4px;">
              <span>Discount Applied:</span>
              <span>-$${invoice.discountTotal.toFixed(2)}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px;">
              <span>Taxes:</span>
              <span>$${invoice.taxTotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <span>Balance Due:</span>
              <span style="color: #dc2626;">$${balanceDue.toFixed(2)}</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
              Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${invoiceUrl}" class="btn">View & Pay Invoice Online</a>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">
            You can also view all contracts and settle invoices anytime in your <a href="${portalUrl}" style="color: #2563eb;">Customer Portal</a>.
          </p>

          <div class="footer">
            Brightloop Software — 100 Enterprise Way, Suite 400 · billing@brightloop.com
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${invoice.invoiceNumber} from Brightloop Software ($${balanceDue.toFixed(2)} due)`,
    html,
  });
}

// 3. Customer Welcome Email
export async function sendWelcomeEmail(to: string, name: string) {
  const portalUrl = `http://localhost:3000/portal`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .logo { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 24px; }
          h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; margin: 12px 0 20px; }
          .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Brightloop Software</div>
          <h1>Welcome to Brightloop, ${name}!</h1>
          <p>Your subscription account has been created successfully. Through the self-service portal, you can:</p>
          <ul style="font-size: 14px; color: #475569; line-height: 1.6; padding-left: 20px;">
            <li>View your active business plans, seats, and add-on modules</li>
            <li>Monitor billing dates and automated renewal schedules</li>
            <li>Settle and download PDF invoices instantly</li>
          </ul>
          <a href="${portalUrl}" class="btn">Open Customer Portal</a>
          <div class="footer">
            Questions? Reply directly to this email or reach us at support@brightloop.com.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Brightloop Software',
    html,
  });
}

