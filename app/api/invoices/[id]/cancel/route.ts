import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized: Only staff can cancel invoices' }, { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
  });

  if (!invoice) {
    return Response.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.status === 'PAID') {
    return Response.json({ error: 'Paid invoices cannot be cancelled without refund' }, { status: 400 });
  }

  const updated = await prisma.invoice.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  });

  return Response.json({ success: true, invoice: updated });
}

