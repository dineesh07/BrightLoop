import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      phone: true,
      country: true,
      vatNumber: true,
    },
    orderBy: { name: 'asc' },
  });

  return Response.json({ customers });
}

