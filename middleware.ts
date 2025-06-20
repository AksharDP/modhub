// Enhanced middleware with comprehensive logging
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from './app/lib/logger';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const pathname = request.nextUrl.pathname;
  
  // Log incoming request
  const requestId = logger.logRequest(request);
  
  // Handle favicon redirect
  if (pathname === '/favicon.ico') {
    const response = NextResponse.redirect(new URL('/favicon.svg', request.url));
    
    // Log response
    const duration = Date.now() - startTime;
    logger.logResponse(requestId, 302, duration, {
      message: 'Favicon redirect'
    });
    
    return response;
  }

  // Create response and add logging
  const response = NextResponse.next();
  
  // Add request ID to response headers for tracing
  response.headers.set('X-Request-ID', requestId);
  
  // Log response (Note: In middleware, we can't easily get the final status code)
  const duration = Date.now() - startTime;
  logger.logResponse(requestId, 200, duration, {
    message: 'Request processed'
  });
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/favicon.ico'
  ],
};
