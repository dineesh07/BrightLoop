import { getSessionUser } from '@/lib/auth';
import { runBillingCycle } from '@/lib/billing';

export async function POST(req: Request) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return Response.json({ error: 'Unauthorized: Only staff and admins can run billing cycles' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const cutoffDate = body.cutoffDate ? new Date(body.cutoffDate) : new Date();

    const result = await runBillingCycle(cutoffDate);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Billing cycle error:', error);
    return Response.json({ error: 'Billing run encountered an error', details: (error as Error).message }, { status: 500 });
  }
}

