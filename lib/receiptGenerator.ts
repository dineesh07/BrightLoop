import { formatINR } from './currency';

export interface ReceiptData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  customer: {
    name: string;
    companyName?: string | null;
    email: string;
    address?: string | null;
  };
  subscription?: {
    subscriptionNumber: string;
    plan?: {
      name: string;
      billingInterval: string;
    };
  } | null;
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    lineTotal: number;
  }>;
  subtotal: number;
  taxTotal: number;
  discountTotal?: number;
  grandTotal: number;
  amountPaid: number;
  payments?: Array<{
    amount: number;
    method: string;
    transactionReference: string;
    paymentDate: string;
    notes?: string | null;
  }>;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const balanceDue = Math.max(0, data.grandTotal - data.amountPaid);
  const isPaid = data.status === 'PAID' || balanceDue <= 0;
  const paymentMethod = data.payments && data.payments.length > 0 
    ? data.payments[0].method.replace('_', ' ') 
    : 'BANK TRANSFER / UPI';
  const paymentRef = data.payments && data.payments.length > 0 
    ? data.payments[0].transactionReference 
    : `REF-${data.invoiceNumber}`;
  const paymentDate = data.payments && data.payments.length > 0 
    ? new Date(data.payments[0].paymentDate).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');

  const rows = data.lines && data.lines.length > 0
    ? data.lines.map((l) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          <strong>${l.description}</strong>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #475569;">
          ${l.quantity}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">
          ${formatINR(l.unitPrice)}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">
          ${l.taxRate}% (${formatINR(l.taxAmount)})
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">
          ${formatINR(l.lineTotal)}
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
          Subscription Service Fee
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #475569;">1</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">${formatINR(data.subtotal)}</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">18% (${formatINR(data.taxTotal)})</td>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">${formatINR(data.grandTotal)}</td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${data.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      padding: 48px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge-paid {
      display: inline-flex;
      align-items: center;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .badge-unpaid {
      display: inline-flex;
      align-items: center;
      background: #fff1f2;
      color: #be123c;
      border: 1px solid #fecdd3;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    .meta-box h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    .meta-box p {
      font-size: 13px;
      color: #334155;
      margin-bottom: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    th {
      background: #f8fafc;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #cbd5e1;
    }
    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-table {
      width: 320px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #475569;
    }
    .totals-row.grand {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 6px;
    }
    .totals-row.paid {
      color: #059669;
      font-weight: 600;
    }
    .totals-row.balance {
      font-size: 14px;
      font-weight: 700;
      color: ${balanceDue > 0 ? '#e11d48' : '#059669'};
      border-top: 1px dashed #e2e8f0;
      padding-top: 8px;
      margin-top: 4px;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .actions {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      display: inline-block;
      padding: 10px 20px;
      background: #4f46e5;
      color: #ffffff;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
    }
    .btn-print:hover {
      background: #4338ca;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-container { box-shadow: none; border: none; padding: 24px; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo-wrapper">
        <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" rx="28" fill="#4f46e5"/>
          <line x1="60" y1="20" x2="60" y2="34" stroke="#ff9800" stroke-width="7" stroke-linecap="round"/>
          <line x1="42" y1="26" x2="52" y2="37" stroke="#ff9800" stroke-width="7" stroke-linecap="round"/>
          <line x1="78" y1="26" x2="68" y2="37" stroke="#ff9800" stroke-width="7" stroke-linecap="round"/>
          <path d="M40 76C47 76 53 70 60 60C67 50 73 44 80 44C88.8 44 96 51.2 96 60C96 68.8 88.8 76 80 76C73 76 67 70 60 60C53 50 47 44 40 44C31.2 44 24 51.2 24 60C24 68.8 31.2 76 40 76Z" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div>
          <h2 style="font-size: 20px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.02em;">Brightloop</h2>
          <p style="font-size: 11px; color: #64748b;">Subscription Billing &amp; Invoicing</p>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="${isPaid ? 'badge-paid' : 'badge-unpaid'}">
          ${isPaid ? 'Official Receipt · Paid' : `Payment Due · ${data.status}`}
        </span>
        <h3 style="font-size: 16px; font-weight: 700; margin-top: 8px; color: #0f172a;">${data.invoiceNumber}</h3>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Date: ${new Date(data.issueDate).toLocaleDateString('en-IN')}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Issued By</h4>
        <p><strong>Brightloop Software Inc.</strong></p>
        <p>100 Enterprise Way, Suite 400</p>
        <p>GSTIN: 27AABCB1234F1Z8</p>
        <p>billing@brightloop.com</p>
      </div>
      <div class="meta-box">
        <h4>Billed &amp; Receipted To</h4>
        <p><strong>${data.customer.name}</strong></p>
        ${data.customer.companyName ? `<p>${data.customer.companyName}</p>` : ''}
        <p>${data.customer.email}</p>
        ${data.customer.address ? `<p>${data.customer.address}</p>` : ''}
        ${data.subscription ? `<p style="font-size: 11px; color: #6366f1; margin-top: 4px;">Ref: ${data.subscription.subscriptionNumber}</p>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Item &amp; Description</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 120px;">Unit Price</th>
          <th style="text-align: right; width: 130px;">GST Rate</th>
          <th style="text-align: right; width: 120px;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatINR(data.subtotal)}</span>
        </div>
        ${data.discountTotal && data.discountTotal > 0 ? `
        <div class="totals-row" style="color: #4f46e5;">
          <span>Discount Applied:</span>
          <span>-${formatINR(data.discountTotal)}</span>
        </div>` : ''}
        <div class="totals-row">
          <span>Taxes (GST 18%):</span>
          <span>${formatINR(data.taxTotal)}</span>
        </div>
        <div class="totals-row grand">
          <span>Grand Total:</span>
          <span>${formatINR(data.grandTotal)}</span>
        </div>
        <div class="totals-row paid">
          <span>Amount Paid:</span>
          <span>-${formatINR(data.amountPaid)}</span>
        </div>
        <div class="totals-row balance">
          <span>Balance Due:</span>
          <span>${formatINR(balanceDue)}</span>
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #475569;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>Payment Settlement:</strong> Settled via <strong>${paymentMethod}</strong> (Ref: <code style="color: #4f46e5;">${paymentRef}</code>)
        </div>
        <div>
          Date: <strong>${paymentDate}</strong>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>This is a computer-generated tax receipt from Brightloop. No physical signature required.</div>
      <div>Page 1 of 1</div>
    </div>

    <div class="actions">
      <button onclick="window.print()" class="btn-print">Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>`;
}

export function downloadReceiptFile(data: ReceiptData) {
  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt-${data.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
