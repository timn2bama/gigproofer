import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to appropriate dashboard after login on homepage
    if (path === '/' && token) {
      if (token.role === 'Lender') {
        return NextResponse.redirect(new URL('/lender/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protect worker routes
    if (path.startsWith('/dashboard') || path.startsWith('/documents') || path.startsWith('/income') || path.startsWith('/reports') || path.startsWith('/subscription')) {
      if (token?.role !== 'Worker') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Protect lender routes
    if (path.startsWith('/lender')) {
      if (token?.role !== 'Lender') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to homepage, login, and signup
        const path = req.nextUrl.pathname;
        if (path === '/' || path === '/login' || path === '/signup') {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/dashboard/:path*', '/documents/:path*', '/income/:path*', '/reports/:path*', '/subscription/:path*', '/lender/:path*'],
};
