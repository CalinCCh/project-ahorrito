import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ClerkMiddlewareAuth } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/landing(.*)',
  '/truelayer-callback(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth: ClerkMiddlewareAuth, req: NextRequest) => {
  const { userId } = await auth();
  
  // Handle root path redirect
  if (req.nextUrl.pathname === '/') {
    if (userId) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      // User is not authenticated, redirect to landing
      return NextResponse.redirect(new URL('/landing', req.url));
    }
  }
  
  // Handle protected routes
  if (!isPublicRoute(req)) {
    if (!userId) {
      const { redirectToSignIn } = await auth();
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};