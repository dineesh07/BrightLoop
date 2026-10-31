import { prisma } from './db';

export interface BillingRunResult {
  subscriptionsProcessed: number;
  invoicesCreated: number;
  totalBilled: number;
  logs: string[];
}

export function calculateNextBillingDate(currentDate: Date, interval: string): Date {
  const next = new Date(currentDate);
  switch (interval.toUpperCase()) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'MONTHLY':
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export function calculateDueDate(issueDate: Date, paymentTerms: string): Date {
  const due = new Date(issueDate);
  const terms = paymentTerms.toLowerCase();
  if (terms.includes('15')) {
    due.setDate(due.getDate() + 15);
  } else if (terms.includes('30')) {
    due.setDate(due.getDate() + 30);
  } else if (terms.includes('60')) {
    due.setDate(due.getDate() + 60);
  } else {
    // Immediate or default
    due.setDate(due.getDate() + 7);
  }
  return due;
}

export async function generateNextInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const year = new Date().getFullYear();
  const nextNum = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${nextNum}`;
}

export async function runBillingCycle(cutoffDate: Date = new Date()): Promise<BillingRunResult> {
  const logs: string[] = [];
  let subscriptionsProcessed = 0;
  let invoicesCreated = 0;
  let totalBilled = 0;

  logs.push(`Starting automated billing run at ${new Date().toISOString()} for cutoff ${cutoffDate.toISOString()}`);

  // Fetch all active subscriptions where nextBillingDate is due
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        lte: cutoffDate,
      },
    },
    include: {
      customer: true,
      plan: true,
      discountRule: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  logs.push(`Found ${dueSubscriptions.length} active subscription(s) due for billing.`);

  // Default tax rule for lines without tax rate
  const defaultTax = await prisma.taxRule.findFirst({
    where: { isDefault: true, active: true },
  });

  for (const sub of dueSubscriptions) {
    subscriptionsProcessed++;
    try {
      // Prevent double billing: Check if an invoice was already created for this subscription today
      const startOfDay = new Date(cutoffDate);
      startOfDay.setHours(0, 0, 0, 0);

      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          createdAt: {
            gte: startOfDay,
          },
        },
      });

      if (existingInvoice) {
        logs.push(`Subscription ${sub.subscriptionNumber} already invoiced today (${existingInvoice.invoiceNumber}). Skipping.`);
        continue;
      }

      // Check discount eligibility
      let discountApplicable = false;
      let appliedDiscountRule = sub.discountRule;

      if (appliedDiscountRule && appliedDiscountRule.active) {
        const now = new Date();
        const dateValid =
          (!appliedDiscountRule.startDate || now >= appliedDiscountRule.startDate) &&
          (!appliedDiscountRule.endDate || now <= appliedDiscountRule.endDate);
        const limitValid =
          appliedDiscountRule.maxUsageLimit === null ||
          appliedDiscountRule.usageCount < appliedDiscountRule.maxUsageLimit;

        if (dateValid && limitValid) {
          discountApplicable = true;
        } else {
          logs.push(`Discount ${appliedDiscountRule.code} expired or usage limit reached for ${sub.subscriptionNumber}.`);
        }
      }

      // Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const invoiceLinesData = [];
      const totalQuantity = sub.lines.reduce((sum, l) => sum + l.quantity, 0);

      for (const line of sub.lines) {
        const lineBaseAmount = line.unitPrice * line.quantity;
        subtotal += lineBaseAmount;

        let lineDiscount = 0;
        if (discountApplicable && appliedDiscountRule) {
          if (appliedDiscountRule.scope === 'SPECIFIC_PRODUCT') {
            if (appliedDiscountRule.productId === line.productId) {
              if (appliedDiscountRule.discountType === 'PERCENTAGE') {
                lineDiscount = lineBaseAmount * (appliedDiscountRule.value / 100);
              } else {
                lineDiscount = Math.min(appliedDiscountRule.value, lineBaseAmount);
              }
            }
          }
        }

        totalDiscount += lineDiscount;

        const effectiveTaxRate = line.taxRate > 0 ? line.taxRate : defaultTax ? defaultTax.rate : 0;
        const taxableAmount = Math.max(0, lineBaseAmount - lineDiscount);
        const lineTax = (taxableAmount * effectiveTaxRate) / 100;

        totalTax += lineTax;

        const desc = `${line.product.name}${line.variant ? ` (${line.variant.name})` : ''}`;

        invoiceLinesData.push({
          productId: line.productId,
          productVariantId: line.productVariantId,
          description: desc,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: effectiveTaxRate,
          taxAmount: Number(lineTax.toFixed(2)),
          discountAmount: Number(lineDiscount.toFixed(2)),
          lineTotal: Number((taxableAmount + lineTax).toFixed(2)),
        });
      }

      // Handle subscription-wide discount
      if (discountApplicable && appliedDiscountRule && appliedDiscountRule.scope === 'ALL_SUBSCRIPTION') {
        let globalDiscount = 0;
        const minQtyMet = !appliedDiscountRule.minQuantity || totalQuantity >= appliedDiscountRule.minQuantity;
        const minPurchaseMet = !appliedDiscountRule.minPurchaseAmount || subtotal >= appliedDiscountRule.minPurchaseAmount;

        if (minQtyMet && minPurchaseMet) {
          if (appliedDiscountRule.discountType === 'PERCENTAGE') {
            globalDiscount = subtotal * (appliedDiscountRule.value / 100);
          } else {
            globalDiscount = Math.min(appliedDiscountRule.value, subtotal);
          }
          totalDiscount += globalDiscount;

          // Re-calculate tax with overall discount proportionally
          const discountRatio = totalDiscount / subtotal;
          totalTax = 0;
          for (const item of invoiceLinesData) {
            const lineDiscountShare = (item.unitPrice * item.quantity) * discountRatio;
            item.discountAmount = Number(lineDiscountShare.toFixed(2));
            const taxable = Math.max(0, item.unitPrice * item.quantity - lineDiscountShare);
            item.taxAmount = Number(((taxable * item.taxRate) / 100).toFixed(2));
            item.lineTotal = Number((taxable + item.taxAmount).toFixed(2));
            totalTax += item.taxAmount;
          }
        }
      }

      const grandTotal = Number(Math.max(0, subtotal - totalDiscount + totalTax).toFixed(2));
      const issueDate = new Date();
      const dueDate = calculateDueDate(issueDate, sub.paymentTerms);
      const invoiceNumber = await generateNextInvoiceNumber();

      // Create the Invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          status: 'DRAFT', // Moves from Draft -> Confirmed -> Paid
          issueDate,
          dueDate,
          subtotal: Number(subtotal.toFixed(2)),
          taxTotal: Number(totalTax.toFixed(2)),
          discountTotal: Number(totalDiscount.toFixed(2)),
          grandTotal,
          amountPaid: 0,
          billingPeriodStart: sub.nextBillingDate,
          billingPeriodEnd: calculateNextBillingDate(sub.nextBillingDate, sub.plan.billingInterval),
          notes: `Automated recurring billing for plan ${sub.plan.name} (${sub.subscriptionNumber})`,
          lines: {
            create: invoiceLinesData,
          },
        },
      });

      invoicesCreated++;
      totalBilled += grandTotal;
      logs.push(`Generated ${invoiceNumber} for ${sub.customer.name} ($${grandTotal.toFixed(2)})`);

      // Increment discount usage if applied
      if (discountApplicable && appliedDiscountRule && totalDiscount > 0) {
        await prisma.discountRule.update({
          where: { id: appliedDiscountRule.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Advance nextBillingDate on the subscription
      const nextDate = calculateNextBillingDate(sub.nextBillingDate, sub.plan.billingInterval);

      // Check auto-close rule: "Some plans should close on their own when they end"
      let shouldClose = false;
      if (sub.plan.autoCloseOnEnd && sub.expiryDate && nextDate >= sub.expiryDate) {
        shouldClose = true;
      }

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          nextBillingDate: nextDate,
          status: shouldClose ? 'CLOSED' : sub.status,
        },
      });

      if (shouldClose) {
        logs.push(`Subscription ${sub.subscriptionNumber} auto-closed as expiry was reached.`);
      }
    } catch (subErr) {
      logs.push(`Error processing subscription ${sub.subscriptionNumber}: ${(subErr as Error).message}`);
    }
  }

  // Audit billing log
  await prisma.billingLog.create({
    data: {
      subscriptionsProcessed,
      invoicesCreated,
      totalBilled,
      status: 'COMPLETED',
      logsJson: JSON.stringify(logs),
    },
  });

  logs.push(`Billing run completed. Created ${invoicesCreated} invoices, total billed: $${totalBilled.toFixed(2)}.`);
  return { subscriptionsProcessed, invoicesCreated, totalBilled, logs };
}

