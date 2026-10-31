import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { planSchema } from '@/lib/validations';

export async function GET() {
  const plans = await prisma.plan.findMany({
    orderBy: { cost: 'asc' },
  });
  return Response.json({ plans });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can configure billing plans' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = planSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid plan configuration' },
        { status: 400 }
      );
    }

    const {
      name,
      code,
      cost,
      billingInterval,
      minQuantity,
      availableStartDate,
      availableEndDate,
      autoCloseOnEnd,
      allowEarlyClose,
      allowPause,
      allowRenewal,
    } = result.data;

    const existing = await prisma.plan.findUnique({
      where: { code },
    });
    if (existing) {
      return Response.json({ error: 'A plan with this code already exists' }, { status: 409 });
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        code,
        cost,
        billingInterval,
        minQuantity,
        availableStartDate: availableStartDate ? new Date(availableStartDate) : null,
        availableEndDate: availableEndDate ? new Date(availableEndDate) : null,
        autoCloseOnEnd,
        allowEarlyClose,
        allowPause,
        allowRenewal,
      },
    });

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error('Create plan error:', error);
    return Response.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

