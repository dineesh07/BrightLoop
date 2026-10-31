import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
  return Response.json({ success: true, message: 'Logged out successfully' });
}

