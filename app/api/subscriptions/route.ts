import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { subscriptionCreateSchema } from '@/lib/validations';
import { calculateNextBillingDate } from '@/lib/billing';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  // Customer can only view their own subscriptions
  const where: any = {};
  if (session.role === 'CUSTOMER') {
    where.customerId = session.userId;
  } else if (searchParams.get('customerId')) {
    where.customerId = searchParams.get('customerId');
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { subscriptionNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { companyName: { contains: search } } },
      { plan: { name: { contains: search } } },
    ];
  }

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },
      plan: true,
      discountRule: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
      _count: {
        select: {
          invoices: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ subscriptions });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // If customer is creating, enforce customerId is their own
    if (session.role === 'CUSTOMER') {
      body.customerId = session.userId;
    }

    const result = subscriptionCreateSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const {
      customerId,
      planId,
      status,
      startDate,
      expiryDate,
      paymentTerms,
      autoRenew,
      discountRuleId,
      notes,
      lines,
    } = result.data;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return Response.json({ error: 'Selected plan not found' }, { status: 404 });
    }

    // Generate unique subscription number e.g. SUB-2026-0005
    const count = await prisma.subscription.count();
    const year = new Date().getFullYear();
    const subscriptionNumber = `SUB-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const effectiveStart = startDate ? new Date(startDate) : new Date();
    const nextBillingDate = calculateNextBillingDate(effectiveStart, plan.billingInterval);

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber,
        customerId,
        planId,
        status: status || 'DRAFT',
        startDate: effectiveStart,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        nextBillingDate,
        paymentTerms,
        autoRenew,
        discountRuleId: discountRuleId || null,
        notes,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            productVariantId: l.productVariantId || null,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate || 0,
            notes: l.notes,
          })),
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return Response.json({ success: true, subscription });
  } catch (error) {
    console.error('Create subscription error:', error);
    return Response.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
