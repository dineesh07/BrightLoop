import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        where: { active: true },
        orderBy: { priceExtra: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ products });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can configure products' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid product specification' },
        { status: 400 }
      );
    }

    const { name, type, salesPrice, costPrice, notes, variants } = result.data;

    const product = await prisma.product.create({
      data: {
        name,
        type,
        salesPrice,
        costPrice,
        notes,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v) => ({
            name: v.name,
            priceExtra: v.priceExtra || 0,
            active: true,
          })),
        } : undefined,
      },
      include: {
        variants: true,
      },
    });

    return Response.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

