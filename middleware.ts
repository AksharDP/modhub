// This file prevents /favicon.ico requests from hitting the edge/server by redirecting to the SVG favicon.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.redirect(new URL('/favicon.svg', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/favicon.ico'],
};
