import { createMiddlewareClient } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object to pass to the middleware client
    const { supabase, supabaseResponse } = createMiddlewareClient(request)

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/research']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // API routes that require authentication (except auth endpoints)
    const protectedApiRoutes = [
      '/api/discover',
      '/api/scrape',
      '/api/generate',
      '/api/analyze',
      '/api/export',
      '/api/categorize',
      '/api/generate-business-report',
      '/api/upload-csv'
    ]
    
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If accessing protected route without session, redirect to home
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // For protected API routes, return 401 if no session
    if (isProtectedApiRoute && !session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    return supabaseResponse
  } catch (e) {
    console.error('Middleware error:', e)
    // If there's an error, allow the request to continue
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}