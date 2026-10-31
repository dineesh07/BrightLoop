import { verifyEmailConnection, sendWelcomeEmail } from '@/lib/email';

export async function GET() {
  const result = await verifyEmailConnection();
  return Response.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const recipient = body.email || process.env.SMTP_USER || 'dineeshkalai07@gmail.com';
    const name = body.name || 'Brightloop Customer';

    console.log(`[Test Email Endpoint] Sending welcome email to ${recipient}...`);
    const result = await sendWelcomeEmail(recipient, name);

    return Response.json({
      success: result.success,
      recipient,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error?.message || 'Failed to dispatch test email',
      },
      { status: 500 }
    );
  }
}
