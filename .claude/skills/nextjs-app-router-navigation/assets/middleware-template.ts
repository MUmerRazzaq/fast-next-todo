import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Assume a session cookie `session` is set on login
  const session = request.cookies.get('session')?.value

  // If the user is not authenticated and is trying to access a protected route,
  // redirect them to the login page.
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If the user is authenticated and is trying to access the login page,
  // redirect them to the dashboard.
  if (session && request.nextUrl.pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths.
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
