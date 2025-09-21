import { NextResponse } from 'next/server'

const SOLANA_MONITOR_SERVICE_URL = process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'

export async function GET() {
  try {
    // Get monitoring stats from the Solana monitor service
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
    
    return NextResponse.json({
      success: true,
      data: data.data || data
    })
  } catch (error) {
    console.error('Error getting monitoring stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get monitoring stats' },
      { status: 500 }
    )
  }
}
