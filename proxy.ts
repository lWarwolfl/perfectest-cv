import { NextRequest, NextResponse } from 'next/server'

const protectedPrefixes = ['/app']
const authPrefixes = ['/auth']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie =
    request.cookies.get('better-auth.session_token')?.value ??
    request.cookies.get('__Secure-better-auth.session_token')?.value

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  const isAuthPage = authPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  if (isAuthPage && sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/app/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/auth/:path*'],
}
