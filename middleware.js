// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Make sure middleware can run
export const config = {
  matcher: [
    // Protected paths
    '/dashboard/:path*',
    // Auth paths that should redirect when authenticated
    '/login',
    '/setup',
  ],
};

// Middleware function
export async function middleware(request) {
  // Get the pathname
  const { pathname } = request.nextUrl;

  // Paths that are protected (require authentication)
  const protectedPaths = ['/dashboard'];
  
  // Public paths that redirect to dashboard if already authenticated
  const authRedirectPaths = ['/login', '/setup'];
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Check if the path is an auth path that should redirect if authenticated
  const isAuthRedirectPath = authRedirectPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Get the auth token from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  
  // Verify the token
  let isAuthenticated = false;
  
  if (authToken) {
    try {
      // Use the same secret as in auth.js
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default-fallback-secret-for-development-only'
      );
      
      // Specify the algorithm
      const { payload } = await jwtVerify(authToken, secret, {
        algorithms: ['HS256']
      });
      
      // Log successful verification
      console.log('Middleware: Successfully verified token for user:', payload.username);
      
      isAuthenticated = true;
    } catch (error) {
      console.error('Token verification in middleware failed:', error.message);
      // Log more details for debugging
      if (authToken) {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          console.log('Token header:', tokenParts[0]);
          // Don't log the full payload for security, just note it exists
          console.log('Token has payload section');
        } else {
          console.log('Token is not in valid JWT format (should have 3 parts)');
        }
      }
      isAuthenticated = false;
    }
  }

  // Handle protected paths - redirect to login if not authenticated
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    // Add the original URL as a return_to parameter
    url.searchParams.set('return_to', pathname);
    return NextResponse.redirect(url);
  }
  
  // Handle auth paths - redirect to dashboard if already authenticated
  if (isAuthRedirectPath && isAuthenticated) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  // Continue with the request for all other paths
  return NextResponse.next();
}