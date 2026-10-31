import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return Response.json({ user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyName: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        vatNumber: true,
        currency: true,
      },
    });

    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error('Session me error:', error);
    return Response.json({ user: null }, { status: 500 });
  }
}
