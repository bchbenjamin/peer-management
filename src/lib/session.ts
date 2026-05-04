import 'server-only';
import { cookies } from 'next/headers';
import { signJWT, verifyJWT } from '@/lib/auth';
import { SessionPayload } from '@/types';

const SESSION_COOKIE = 'spc_session';

export async function createSession(payload: SessionPayload) {
  const token = await signJWT(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return await verifyJWT(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
