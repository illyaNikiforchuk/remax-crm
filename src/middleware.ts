import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('crm_session')?.value

  let isValid = false
  if (token) {
    try {
      await jwtVerify(token, getSecret())
      isValid = true
    } catch {
      isValid = false
    }
  }

  if (!isValid && pathname !== '/login' && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isValid && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
