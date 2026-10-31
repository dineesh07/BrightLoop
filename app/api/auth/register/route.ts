import { prisma } from '@/lib/db';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid registration data' },
        { status: 400 }
      );
    }

    const { email, password, name, companyName, phone, address, city, country, vatNumber } = result.data;

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return Response.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: 'CUSTOMER',
        companyName: companyName || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        country: country || null,
        vatNumber: vatNumber || null,
      },
    });

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: 'CUSTOMER' as const,
      name: newUser.name,
    };

    const token = signToken(payload);

    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        companyName: newUser.companyName,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

