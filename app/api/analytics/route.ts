import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (session && session.role === 'CUSTOMER') {
    return Response.json({ error: 'Customer accounts must access the customer portal' }, { status: 403 });
  }

  const startTime = performance.now();
  const now = new Date();

  // 1. Parallel aggregates for sub-second performance
  const [
    activeSubscriptions,
    allSubscriptionsCount,
    allInvoices,
    allPayments,
    plans,
    overdueInvoicesList,
  ] = await Promise.all([
    // Active subscriptions with lines and plan for accurate MRR
    prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: {
        plan: true,
        lines: true,
      },
    }),
    prisma.subscription.count(),
    // All invoices for receivables
    prisma.invoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        grandTotal: true,
        amountPaid: true,
        dueDate: true,
        issueDate: true,
      },
    }),
    // Payments for cash collected
    prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        method: true,
      },
    }),
    // Plans
    prisma.plan.findMany({
      select: { id: true, name: true, billingInterval: true },
    }),
    // Top overdue invoices
    prisma.invoice.findMany({
      where: {
        dueDate: { lt: now },
        status: { not: 'PAID' },
      },
      include: {
        customer: {
          select: { name: true, companyName: true, email: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
  ]);

  // Compute MRR & ARR accurately
  let mrr = 0;
  for (const sub of activeSubscriptions) {
    const linesTotal = sub.lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
    const subAmount = linesTotal > 0 ? linesTotal : sub.plan.cost;

    switch (sub.plan.billingInterval) {
      case 'DAILY':
        mrr += subAmount * 30;
        break;
      case 'WEEKLY':
        mrr += subAmount * 4.33;
        break;
      case 'YEARLY':
        mrr += subAmount / 12;
        break;
      case 'MONTHLY':
      default:
        mrr += subAmount;
        break;
    }
  }

  const arr = mrr * 12;

  // Total revenue collected
  const totalRevenueCollected = allPayments.reduce((acc, p) => acc + p.amount, 0);

  // Outstanding / Unpaid
  let outstandingRevenue = 0;
  let overdueCount = 0;
  let overdueAmount = 0;

  for (const inv of allInvoices) {
    if (inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
      const owed = Math.max(0, inv.grandTotal - inv.amountPaid);
      outstandingRevenue += owed;

      if (new Date(inv.dueDate) < now) {
        overdueCount++;
        overdueAmount += owed;
      }
    }
  }

  // Monthly Revenue Trend (Last 6 months)
  const monthMap = new Map<string, number>();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    monthMap.set(key, 0);
  }

  for (const pay of allPayments) {
    const d = new Date(pay.paymentDate);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + pay.amount);
    }
  }

  const revenueTrend = Array.from(monthMap.entries()).map(([month, amount]) => ({
    month,
    revenue: Number(amount.toFixed(2)),
  }));

  // Subscriptions by Plan
  const planDistributionMap = new Map<string, number>();
  for (const sub of activeSubscriptions) {
    const planName = sub.plan.name;
    planDistributionMap.set(planName, (planDistributionMap.get(planName) || 0) + 1);
  }
  const subscriptionsByPlan = Array.from(planDistributionMap.entries()).map(([plan, count]) => ({
    plan,
    count,
  }));

  // Payment Methods
  const methodMap = new Map<string, number>();
  for (const p of allPayments) {
    methodMap.set(p.method, (methodMap.get(p.method) || 0) + p.amount);
  }
  const paymentMethods = Array.from(methodMap.entries()).map(([method, amount]) => ({
    method,
    amount: Number(amount.toFixed(2)),
  }));

  const responseTimeMs = Number((performance.now() - startTime).toFixed(2));

  return Response.json({
    metrics: {
      activeSubscriptions: activeSubscriptions.length,
      totalSubscriptions: allSubscriptionsCount,
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      totalRevenueCollected: Number(totalRevenueCollected.toFixed(2)),
      outstandingRevenue: Number(outstandingRevenue.toFixed(2)),
      overdueInvoicesCount: overdueCount,
      overdueAmount: Number(overdueAmount.toFixed(2)),
      responseTimeMs,
    },
    revenueTrend,
    subscriptionsByPlan,
    paymentMethods,
    overdueInvoices: overdueInvoicesList,
  });
}
