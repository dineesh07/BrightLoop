import { jsPDF } from 'jspdf';
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
    city?: string | null;
    country?: string | null;
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

/**
 * Generates and downloads an authentic, professional PDF document directly.
 */
export function downloadReceiptPDF(data: ReceiptData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const balanceDue = Math.max(0, data.grandTotal - data.amountPaid);
  const isPaid = data.status === 'PAID' || balanceDue <= 0;

  let y = margin;

  // 1. HEADER: Draw Brand Logo (Sunburst Rays + Infinity Loop)
  // Orange Sunburst Rays
  doc.setDrawColor(245, 158, 11); // Amber #F59E0B
  doc.setLineWidth(0.8);
  // Center ray
  doc.line(margin + 6, y + 2, margin + 6, y + 5);
  // Left ray
  doc.line(margin + 3.5, y + 3, margin + 4.5, y + 5.5);
  // Right ray
  doc.line(margin + 8.5, y + 3, margin + 7.5, y + 5.5);

  // Indigo Infinity Loop
  doc.setDrawColor(79, 70, 229); // Indigo #4F46E5
  doc.setLineWidth(1.2);
  // Draw left loop and right loop
  doc.ellipse(margin + 3.5, y + 9, 3.2, 2.4);
  doc.ellipse(margin + 8.5, y + 9, 3.2, 2.4);

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(49, 46, 129); // Deep Indigo
  doc.text('Brightloop', margin + 14, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Subscription Billing & Revenue Platform', margin + 14, y + 14);

  // Right Header: Receipt Status & Details
  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(pageWidth - margin - 38, y + 2, 38, 7.5, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.text('PAID · OFFICIAL RECEIPT', pageWidth - margin - 35, y + 7);
  } else {
    doc.setFillColor(254, 242, 242); // Rose 50
    doc.setDrawColor(254, 205, 211); // Rose 200
    doc.roundedRect(pageWidth - margin - 36, y + 2, 36, 7.5, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(190, 18, 60); // Rose 700
    doc.text(`DUE · ${data.status}`, pageWidth - margin - 33, y + 7);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(data.invoiceNumber, pageWidth - margin, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issue Date: ${new Date(data.issueDate).toLocaleDateString('en-IN')}`, pageWidth - margin, y + 19, { align: 'right' });
  doc.text(`Due Date: ${new Date(data.dueDate).toLocaleDateString('en-IN')}`, pageWidth - margin, y + 23, { align: 'right' });

  // Divider Line
  y += 28;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 2. METADATA: ISSUED BY & BILLED TO
  y += 6;
  const colWidth = contentWidth / 2;

  // Left Col: Issued By
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('ISSUED BY', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Brightloop Software Inc.', margin, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('100 Enterprise Way, Suite 400', margin, y + 8.5);
  doc.text('GSTIN: 27AABCB1234F1Z8', margin, y + 12.5);
  doc.text('Email: billing@brightloop.com', margin, y + 16.5);

  // Right Col: Billed To
  const rightColX = margin + colWidth + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('BILLED TO', rightColX, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.customer.name, rightColX, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let billY = y + 8.5;
  if (data.customer.companyName) {
    doc.text(data.customer.companyName, rightColX, billY);
    billY += 4;
  }
  doc.text(data.customer.email, rightColX, billY);
  billY += 4;
  if (data.customer.address) {
    doc.text(data.customer.address, rightColX, billY);
    billY += 4;
  }
  if (data.subscription) {
    doc.setTextColor(79, 70, 229);
    doc.text(`Subscription Ref: ${data.subscription.subscriptionNumber}`, rightColX, billY);
    billY += 4;
  }

  y = Math.max(y + 22, billY + 2);

  // 3. LINE ITEMS TABLE
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 7, pageWidth - margin, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ITEM & DESCRIPTION', margin + 3, y + 4.8);
  doc.text('QTY', margin + 92, y + 4.8, { align: 'center' });
  doc.text('UNIT PRICE', margin + 118, y + 4.8, { align: 'right' });
  doc.text('GST RATE', margin + 142, y + 4.8, { align: 'right' });
  doc.text('AMOUNT (INR)', pageWidth - margin - 3, y + 4.8, { align: 'right' });

  y += 7;

  const lines = data.lines && data.lines.length > 0 ? data.lines : [
    {
      description: 'Subscription Service Plan',
      quantity: 1,
      unitPrice: data.subtotal,
      taxRate: 18,
      taxAmount: data.taxTotal,
      lineTotal: data.grandTotal,
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  for (const line of lines) {
    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text(line.description, margin + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(line.quantity), margin + 92, y, { align: 'center' });
    doc.text(formatINR(line.unitPrice), margin + 118, y, { align: 'right' });
    doc.text(`${line.taxRate}%`, margin + 142, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatINR(line.lineTotal), pageWidth - margin - 3, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 2.5;
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
  }

  // 4. TOTALS SUMMARY AREA
  y += 6;
  const summaryX = pageWidth - margin - 75;
  const summaryValX = pageWidth - margin - 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', summaryX, y);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(data.subtotal), summaryValX, y, { align: 'right' });

  if (data.discountTotal && data.discountTotal > 0) {
    y += 4.5;
    doc.setTextColor(79, 70, 229);
    doc.text('Discount Applied:', summaryX, y);
    doc.text(`-${formatINR(data.discountTotal)}`, summaryValX, y, { align: 'right' });
  }

  y += 4.5;
  doc.setTextColor(100, 116, 139);
  doc.text('GST Total (18%):', summaryX, y);
  doc.setTextColor(15, 23, 42);
  doc.text(formatINR(data.taxTotal), summaryValX, y, { align: 'right' });

  y += 5.5;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(summaryX, y - 1, pageWidth - margin, y - 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', summaryX, y + 3);
  doc.text(formatINR(data.grandTotal), summaryValX, y + 3, { align: 'right' });

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text('Amount Paid:', summaryX, y);
  doc.text(`-${formatINR(data.amountPaid)}`, summaryValX, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX, y - 1, pageWidth - margin, y - 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (balanceDue > 0) {
    doc.setTextColor(225, 29, 72);
    doc.text('Balance Due:', summaryX, y + 3);
    doc.text(formatINR(balanceDue), summaryValX, y + 3, { align: 'right' });
  } else {
    doc.setTextColor(5, 150, 105);
    doc.text('Balance Due:', summaryX, y + 3);
    doc.text('₹0.00 (Fully Settled)', summaryValX, y + 3, { align: 'right' });
  }

  // 5. PAYMENT SETTLEMENT DETAILS BOX
  y += 14;
  const paymentMethod = data.payments && data.payments.length > 0 
    ? data.payments[0].method.replace('_', ' ') 
    : 'BANK WIRE / UPI';
  const paymentRef = data.payments && data.payments.length > 0 
    ? data.payments[0].transactionReference 
    : `PAY-${data.invoiceNumber}`;
  const paymentDate = data.payments && data.payments.length > 0 
    ? new Date(data.payments[0].paymentDate).toLocaleDateString('en-IN') 
    : new Date().toLocaleDateString('en-IN');

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 13, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Payment Settlement:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Settled via ${paymentMethod}  ·  Reference: ${paymentRef}`, margin + 35, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Settlement Date:', margin + 4, y + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(paymentDate, margin + 35, y + 9.5);

  // 6. FOOTER
  const footerY = pageHeight - margin - 8;
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated tax receipt from Brightloop. Authorized digital record.', margin, footerY + 4);
  doc.text('Brightloop Software Inc. · www.brightloop.com', pageWidth - margin, footerY + 4, { align: 'right' });

  // Direct Save as PDF file
  doc.save(`Receipt-${data.invoiceNumber}.pdf`);
}

/**
 * Backward compatibility alias: downloads authentic PDF directly.
 */
export function downloadReceiptFile(data: ReceiptData) {
  downloadReceiptPDF(data);
}
