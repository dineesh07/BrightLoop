import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: result.error.errors[0]?.message || 'Invalid password reset parameters' },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return Response.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return Response.json({
      success: true,
      message: 'Password successfully updated. You can now log in with your new credentials.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

