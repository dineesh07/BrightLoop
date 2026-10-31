import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized: Only staff can dispatch invoices' }, { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });

  if (!invoice) {
    return Response.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      sentAt: new Date(),
      status: invoice.status === 'DRAFT' ? 'CONFIRMED' : invoice.status,
    },
    include: {
      customer: true,
      lines: true,
    },
  });

  // Send real email via Nodemailer
  const { sendInvoiceEmail } = await import('@/lib/email');
  await sendInvoiceEmail(updated, invoice.customer.email);

  return Response.json({
    success: true,
    message: `Invoice ${invoice.invoiceNumber} emailed via Nodemailer to ${invoice.customer.email}`,
    invoice: updated,
  });
}

