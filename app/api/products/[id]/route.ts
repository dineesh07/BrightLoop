import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { productSchema } from '@/lib/validations';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: {
        where: { active: true },
        orderBy: { priceExtra: 'asc' },
      },
    },
  });

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  return Response.json({ product });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized: Only admins can edit products' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: result.error.errors[0]?.message }, { status: 400 });
    }

    const { name, type, salesPrice, costPrice, notes, variants } = result.data;

    // Update product core fields
    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          type,
          salesPrice,
          costPrice,
          notes,
        },
      });

      if (variants) {
        // Delete variants not in the update and upsert the rest
        await tx.productVariant.deleteMany({
          where: { productId: params.id },
        });

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v) => ({
              productId: params.id,
              name: v.name,
              priceExtra: v.priceExtra || 0,
              active: true,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id: params.id },
        include: { variants: true },
      });
    });

    return Response.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

