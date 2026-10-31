import { prisma } from '@/lib/db';
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'STAFF' | 'CUSTOMER',
      name: user.name,
    };

    const token = signToken(payload);

    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
