import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is trying to access dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, you would check for valid authentication token
    // For this demo, we'll just check if there's any indication of being logged in
    // You might want to implement proper JWT validation here
    
    // This is a simplified check - in production you'd validate the token properly
    const userCookie = request.cookies.get('user');
    
    if (!userCookie) {
      // Redirect to login if no user session
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*'
};