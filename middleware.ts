import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const hasSession = req.cookies.has('__session')

    if (!hasSession && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }
}

export const config = {
    matcher: ['/dashboard(.*)'],
}
