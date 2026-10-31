import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const logs = await prisma.billingLog.findMany({
    orderBy: { executedAt: 'desc' },
    take: 50,
  });

  return Response.json({ logs });
}
