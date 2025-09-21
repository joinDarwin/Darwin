import { NextRequest, NextResponse } from 'next/server'

// External service URLs - these should be set in environment variables
const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3002'

export async function GET() {
  try {
    // Forward request to dedicated timer service
    const response = await fetch(`${TIMER_SERVICE_URL}/api/timer/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Timer service responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting timer state from service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get timer state' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'reset') {
      // Forward reset request to dedicated timer service
      const response = await fetch(`${TIMER_SERVICE_URL}/api/timer/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`Timer service responded with status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing timer action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process timer action' },
      { status: 500 }
    )
  }
}