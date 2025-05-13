import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Protected routes (require authentication)
const protectedRoutes = [
  '/dashboard',
  '/add-api-key',
  '/settings',
  '/analytics',
  '/alerts',
  '/billing',
];

// Authentication routes
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/confirm',
];

// Public routes that should bypass auth checks
const publicRoutes = [
  '/',
  '/landing',
  '/about',
  '/pricing',
  '/contact',
];

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;

  // If it's a public route, just proceed without auth checks
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Static assets or API routes should also bypass auth checks
  if (
    pathname.startsWith('/_next/') || 
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Create a response to modify
  const response = NextResponse.next();

  // Create a Supabase client for server-side auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
        set: (key, value, options) => {
          response.cookies.set(key, value, options);
        },
        remove: (key, options) => {
          response.cookies.set(key, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // If trying to access a protected route without being authenticated
  if (isProtectedRoute && !isAuthenticated) {
    // Store the original URL to redirect back after login
    const returnUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/login?returnUrl=${returnUrl}`, request.url));
  }

  // If trying to access an auth route while authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Match all routes except static files and images
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 