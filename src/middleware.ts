import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

import NextAuth from 'next-auth';
import authConfig from './auth.config';

//export { auth as middleware } from '@/auth';

export default async function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware(routing);

  const response = handleI18nRouting(request);

  const { auth } = NextAuth(authConfig);

  return { ...response, auth };
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt|en|es)/:path*']
};
