import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { taxRuleSchema } from '@/lib/validations';

export async function GET() {
  const taxes = await prisma.taxRule.findMany({
    orderBy: { rate: 'asc' },
  });
  return Response.json({ taxes });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can manage tax rules' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = taxRuleSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.errors[0]?.message }, { status: 400 });
    }

    const { name, rate, country, isDefault } = result.data;

    // If setting default, unset existing default
    if (isDefault) {
      await prisma.taxRule.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const tax = await prisma.taxRule.create({
      data: {
        name,
        rate,
        country: country || null,
        isDefault,
        active: true,
      },
    });

    return Response.json({ success: true, tax });
  } catch (error) {
    console.error('Create tax error:', error);
    return Response.json({ error: 'Failed to create tax rule' }, { status: 500 });
  }
}

