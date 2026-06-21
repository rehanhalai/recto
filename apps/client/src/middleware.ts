import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('session_id')

  if (request.nextUrl.pathname === '/' && hasSession) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/feed') && !hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // matcher: ['/', '/feed'],
  matcher: ["/"]
}
