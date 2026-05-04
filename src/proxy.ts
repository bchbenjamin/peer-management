import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';
import { Role } from './types';

const PUBLIC_ROUTES = ['/', '/login', '/api/auth/login'];
const MFA_SETUP_ROUTES = ['/dashboard/settings/2fa'];
const API_AUTH_ROUTES = ['/api/auth/totp/setup', '/api/auth/totp/verify', '/api/auth/logout'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If they are logged in and verified, redirect to dashboard
    const token = request.cookies.get('spc_session')?.value;
    if (token) {
      const session = await verifyJWT(token);
      if (session) {
        if ((session.isMaster || session.mfaRequired) && !session.mfaVerified && !MFA_SETUP_ROUTES.includes(pathname)) {
          return NextResponse.redirect(new URL('/dashboard/settings/2fa', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  const token = request.cookies.get('spc_session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifyJWT(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('spc_session');
    return response;
  }

  // MFA check
  // If not MFA verified, force them to the 2FA setup/verify page unless they are calling auth APIs
  if ((session.isMaster || session.mfaRequired) && !session.mfaVerified && !MFA_SETUP_ROUTES.includes(pathname) && !API_AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard/settings/2fa', request.url));
  }

  // RBAC for students
  if (session.role === Role.STUDENT) {
    const blockedForStudents = [
      '/dashboard/attendance',
      '/dashboard/users',
      '/dashboard/students',
      '/api/users',
      '/api/students/import'
    ];

    const isMfaSetup = MFA_SETUP_ROUTES.includes(pathname);
    const isGdDetail = pathname.startsWith('/dashboard/gd/') && pathname !== '/dashboard/gd';

    if (!isMfaSetup && (blockedForStudents.some(route => pathname.startsWith(route)) || isGdDetail)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
