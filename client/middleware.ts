import { NextRequest, NextResponse } from 'next/server';

// Simple middleware - no authentication blocking
// Firebase handles auth globally
export function middleware(request: NextRequest) {
  // Let all requests through - no blocking
  return NextResponse.next();
}

export const config = {
  // Don't run middleware on any routes - let everything through
  matcher: [],
}
