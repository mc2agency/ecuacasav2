import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only check auth for admin routes - skip Supabase calls for public pages
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
