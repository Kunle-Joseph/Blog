import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-previous-path', request.headers.get('referer') || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}