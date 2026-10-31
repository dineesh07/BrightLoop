import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
      payments: {
        include: {
          recordedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      },
    },
  });

  if (!invoice) {
    return Response.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (session.role === 'CUSTOMER' && invoice.customerId !== session.userId) {
    return Response.json({ error: 'Unauthorized to view this invoice' }, { status: 403 });
  }

  return Response.json({ invoice });
}

