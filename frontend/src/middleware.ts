import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  const isLoginPage = path.startsWith('/login') || path.startsWith('/register');
  const isOnboarding = path.startsWith('/onboarding');
  const isInvitePage = path.startsWith('/invite');
  const isApiAuth = path.startsWith('/api/auth');
  const isApiOnboarding = path.startsWith('/api/onboarding');
  const isApiMe = path.startsWith('/api/me');
  const isApiInvitation = path.startsWith('/api/invitations');
  const isApiSettings = path.startsWith('/api/settings');

  // Always allow API routes
  if (isApiAuth || isApiOnboarding || isApiMe || isApiInvitation || isApiSettings) return NextResponse.next();

  // No token: only allow login/register/invite pages
  if (!token) {
    if (isLoginPage || isOnboarding || isInvitePage) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  // Invalid token: send to login
  if (!payload) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Valid token — onboarding and invite pages are ALWAYS accessible
  if (isOnboarding || isInvitePage) return NextResponse.next();

  // Valid token — don't re-show login/register
  if (isLoginPage) return NextResponse.redirect(new URL('/', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
