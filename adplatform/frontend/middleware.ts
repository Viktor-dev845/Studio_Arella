import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // 1. Developer Bypass Mechanism
  // If the developer visits any URL with ?dev=arella, we set a cookie and redirect
  // them back to the same page without the query parameter.
  if (url.searchParams.get('dev') === 'arella') {
    url.searchParams.delete('dev');
    const response = NextResponse.redirect(url);
    // Set a cookie valid for 30 days
    response.cookies.set('dev_bypass', 'true', { maxAge: 60 * 60 * 24 * 30, path: '/' });
    return response;
  }

  // 2. Allow requests if the developer bypass cookie is present
  if (request.cookies.has('dev_bypass')) {
    return NextResponse.next();
  }

  const isStaticImage = /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname);

  // 3. Allow Next.js static assets, API routes, and the Blog itself
  const isAllowedPath = 
    isStaticImage ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/blog') ||
    url.pathname.startsWith('/book-ad');

  if (isAllowedPath) {
    return NextResponse.next();
  }

  // 4. Block everything else for normal users
  // Redirect them to the blog page instead of showing the actual platform
  url.pathname = '/blog';
  return NextResponse.redirect(url);
}

export const config = {
  // Apply middleware to all paths except the ones explicitly listed here to optimize performance
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
