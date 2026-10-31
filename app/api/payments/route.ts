import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { paymentRecordSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoiceId');

  const where: any = {};
  if (invoiceId) {
    where.invoiceId = invoiceId;
  }

  // If customer, restrict to payments for their invoices
  if (session.role === 'CUSTOMER') {
    where.invoice = { customerId: session.userId };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          grandTotal: true,
          customer: {
            select: { name: true, companyName: true },
          },
        },
      },
      recordedBy: {
        select: { name: true, email: true },
      },
    },
    orderBy: { paymentDate: 'desc' },
  });

  return Response.json({ payments });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = paymentRecordSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid payment record' },
        { status: 400 }
      );
    }

    const { invoiceId, amount, paymentDate, method, transactionReference, notes } = result.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Customer can only pay their own invoices
    if (session.role === 'CUSTOMER' && invoice.customerId !== session.userId) {
      return Response.json({ error: 'Unauthorized to pay this invoice' }, { status: 403 });
    }

    const effectiveDate = paymentDate ? new Date(paymentDate) : new Date();

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentDate: effectiveDate,
          method,
          transactionReference,
          notes,
          recordedById: session.userId,
        },
      });

      const updatedAmountPaid = Number((invoice.amountPaid + amount).toFixed(2));
      const isFullyPaid = updatedAmountPaid >= (invoice.grandTotal - 0.01); // Handle floating point tolerance

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: updatedAmountPaid,
          status: isFullyPaid ? 'PAID' : (invoice.status === 'DRAFT' ? 'CONFIRMED' : invoice.status),
        },
      });

      return p;
    });

    return Response.json({ success: true, payment });
  } catch (error) {
    console.error('Record payment error:', error);
    return Response.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
