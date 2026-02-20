import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Refresh Supabase session for admin routes and admin API routes
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    return await updateSession(request);
  }
  
  // Public routes - no Supabase auth check needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml)$).*)',
  ],
};
