import { getSessionUser, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { staffCreateSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can manage staff' }, { status: 403 });
  }

  const staff = await prisma.user.findMany({
    where: {
      role: { in: ['STAFF', 'ADMIN'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ staff });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can add staff members' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = staffCreateSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid staff details' },
        { status: 400 }
      );
    }

    const { email, name, password, role } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return Response.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newStaff = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
        companyName: 'Brightloop Internal Team',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json({ success: true, staff: newStaff });
  } catch (error) {
    console.error('Create staff error:', error);
    return Response.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}

