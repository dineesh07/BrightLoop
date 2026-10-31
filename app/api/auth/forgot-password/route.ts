import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validations';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak existence, return generic success message
      return Response.json({
        success: true,
        message: 'If this email is registered, a password reset link has been dispatched.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    const resetUrl = `/auth/reset-password?token=${token}`;

    // Send email using Nodemailer
    const { sendPasswordResetEmail } = await import('@/lib/email');
    await sendPasswordResetEmail(user.email, resetUrl);

    return Response.json({
      success: true,
      message: `Password reset email dispatched to ${user.email}.`,
      simulatedResetUrl: resetUrl,
      token,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
