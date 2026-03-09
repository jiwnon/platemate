import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';
import {
  updateSession,
  getLocaleFromPathname,
  isDashboardPath,
} from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: Request) {
  const nextRequest = request as import('next/server').NextRequest;
  const response = intlMiddleware(nextRequest);

  // next-intl이 이미 리다이렉트한 경우 그대로 반환
  if (response.status === 307 || response.status === 308 || response.headers.get('Location')) {
    return response;
  }

  const { response: resWithSession, user } = await updateSession(
    nextRequest,
    response as import('next/server').NextResponse
  );

  const pathname = nextRequest.nextUrl.pathname;
  if (isDashboardPath(pathname) && !user) {
    const locale = getLocaleFromPathname(pathname);
    const loginUrl = new URL(`/${locale}/login`, nextRequest.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return resWithSession;
}

export const config = {
  matcher: ['/', '/(ko|en|zh|ja)/:path*', '/dashboard', '/dashboard/:path*'],
};
