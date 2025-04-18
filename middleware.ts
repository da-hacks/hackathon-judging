import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware doesn't actually do anything with requests
// Its main purpose is to trigger initialization as early as possible
export function middleware(request: NextRequest) {
  // Just continue processing the request
  return NextResponse.next();
}

// Remove the database initialization in middleware
// This was causing the Edge Runtime error because it used process.cwd 