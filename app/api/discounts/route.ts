import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { discountRuleSchema } from '@/lib/validations';

export async function GET() {
  const discounts = await prisma.discountRule.findMany({
    include: {
      product: {
        select: { id: true, name: true },
      },
      _count: {
        select: { subscriptions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return Response.json({ discounts });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can create discount rules' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = discountRuleSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.errors[0]?.message }, { status: 400 });
    }

    const {
      code,
      description,
      discountType,
      value,
      minPurchaseAmount,
      minQuantity,
      startDate,
      endDate,
      maxUsageLimit,
      scope,
      productId,
    } = result.data;

    const existing = await prisma.discountRule.findUnique({
      where: { code },
    });

    if (existing) {
      return Response.json({ error: 'Discount code already exists' }, { status: 409 });
    }

    const discount = await prisma.discountRule.create({
      data: {
        code,
        description,
        discountType,
        value,
        minPurchaseAmount: minPurchaseAmount ?? null,
        minQuantity: minQuantity ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        maxUsageLimit: maxUsageLimit ?? null,
        scope,
        productId: scope === 'SPECIFIC_PRODUCT' ? productId : null,
        active: true,
      },
      include: {
        product: true,
      },
    });

    return Response.json({ success: true, discount });
  } catch (error) {
    console.error('Create discount error:', error);
    return Response.json({ error: 'Failed to create discount rule' }, { status: 500 });
  }
}

