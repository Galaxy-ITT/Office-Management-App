import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Clear auth token cookie
  (await
        // Clear auth token cookie
        cookies()).delete('auth_token')
  
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })
}