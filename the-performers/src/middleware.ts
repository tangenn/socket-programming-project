import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware disabled - authentication is handled client-side via socket.emit('getMe')
// The server validates sessions via sid_to_user mapping
// Cookies are still set for potential future use, but not checked here

export function middleware(request: NextRequest) {
  // Allow all requests through - client-side handles auth via getMe
  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
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
  ],
};
