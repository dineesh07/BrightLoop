import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const overdueOnly = searchParams.get('overdue') === 'true';

  const where: any = {};

  // Customer role restriction
  if (session.role === 'CUSTOMER') {
    where.customerId = session.userId;
  } else if (searchParams.get('customerId')) {
    where.customerId = searchParams.get('customerId');
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (overdueOnly) {
    where.dueDate = { lt: new Date() };
    where.status = { not: 'PAID' };
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { companyName: { contains: search } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          country: true,
        },
      },
      subscription: {
        select: {
          id: true,
          subscriptionNumber: true,
          plan: {
            select: { name: true, billingInterval: true },
          },
        },
      },
      payments: true,
      lines: true,
    },
    orderBy: { issueDate: 'desc' },
  });

  return Response.json({ invoices });
}
