import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Get username from cookie (we'll need to set this on login)
  const username = request.cookies.get('username')?.value;
  
  // If trying to access a protected route without being logged in
  if (!isPublicRoute && !username) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If logged in and trying to access login/register, redirect to home
  if (username && (pathname === '/login' || pathname === '/register')) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
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
