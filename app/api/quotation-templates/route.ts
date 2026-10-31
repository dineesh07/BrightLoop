import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { quotationTemplateSchema } from '@/lib/validations';

export async function GET() {
  const templates = await prisma.quotationTemplate.findMany({
    include: {
      plan: true,
      lines: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ templates });
}

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized: Only staff and admins can create quotation templates' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = quotationTemplateSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid quotation template' },
        { status: 400 }
      );
    }

    const { name, planId, validityDays, notes, lines } = result.data;

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        planId,
        validityDays,
        notes,
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            productVariantId: l.productVariantId || null,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        },
      },
      include: {
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return Response.json({ success: true, template });
  } catch (error) {
    console.error('Create template error:', error);
    return Response.json({ error: 'Failed to create quotation template' }, { status: 500 });
  }
}

