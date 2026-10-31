import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateNextBillingDate } from '@/lib/billing';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          vatNumber: true,
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
      invoices: {
        orderBy: { issueDate: 'desc' },
        include: {
          payments: true,
        },
      },
    },
  });

  if (!subscription) {
    return Response.json({ error: 'Subscription not found' }, { status: 404 });
  }

  // Customer authorization check
  if (session.role === 'CUSTOMER' && subscription.customerId !== session.userId) {
    return Response.json({ error: 'Unauthorized to view this subscription' }, { status: 403 });
  }

  return Response.json({ subscription });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: { plan: true },
  });

  if (!existing) {
    return Response.json({ error: 'Subscription not found' }, { status: 404 });
  }

  // Customer check
  if (session.role === 'CUSTOMER' && existing.customerId !== session.userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, status, autoRenew, notes } = body;

    const dataToUpdate: any = {};

    if (action === 'PAUSE') {
      if (!existing.plan.allowPause && session.role === 'CUSTOMER') {
        return Response.json({ error: 'This plan does not permit pausing' }, { status: 400 });
      }
      dataToUpdate.status = 'PAUSED';
    } else if (action === 'RESUME') {
      dataToUpdate.status = 'ACTIVE';
    } else if (action === 'CLOSE') {
      if (!existing.plan.allowEarlyClose && session.role === 'CUSTOMER') {
        return Response.json({ error: 'This plan does not allow early closure' }, { status: 400 });
      }
      dataToUpdate.status = 'CLOSED';
    } else if (action === 'RENEW') {
      if (!existing.plan.allowRenewal && session.role === 'CUSTOMER') {
        return Response.json({ error: 'This plan does not permit renewal' }, { status: 400 });
      }
      dataToUpdate.status = 'ACTIVE';
      dataToUpdate.nextBillingDate = calculateNextBillingDate(new Date(), existing.plan.billingInterval);
    } else if (action === 'CONFIRM') {
      // Moves from Quotation/Draft to Confirmed
      dataToUpdate.status = 'CONFIRMED';
    } else if (action === 'ACTIVATE') {
      // Moves from Confirmed to Active
      dataToUpdate.status = 'ACTIVE';
    } else if (status) {
      dataToUpdate.status = status;
    }

    if (autoRenew !== undefined) {
      dataToUpdate.autoRenew = Boolean(autoRenew);
    }

    if (notes !== undefined) {
      dataToUpdate.notes = notes;
    }

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: dataToUpdate,
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

    return Response.json({ success: true, subscription: updated });
  } catch (error) {
    console.error('Update subscription error:', error);
    return Response.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

