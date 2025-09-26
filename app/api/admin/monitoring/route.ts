import { NextRequest, NextResponse } from 'next/server'

// External service URLs - these should be set in environment variables
const SOLANA_MONITOR_SERVICE_URL = process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Forward request to Solana monitor service
    const response = await fetch(`${SOLANA_MONITOR_SERVICE_URL}/api/monitor/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Monitor service responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting monitoring state from service:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch monitoring state'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (typeof body.enabled === 'boolean') {
      // Forward request to Solana monitor service
      const action = body.enabled ? 'start' : 'stop'
      const response = await fetch(`${SOLANA_MONITOR_SERVICE_URL}/api/monitor/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`Monitor service responded with status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({
        success: true,
        data: { enabled: body.enabled },
        message: `Monitoring ${body.enabled ? 'enabled' : 'disabled'} successfully`
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid enabled value'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating monitoring state:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update monitoring state'
    }, { status: 500 })
  }
}