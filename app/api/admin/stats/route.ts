import { NextRequest, NextResponse } from 'next/server'

const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    // Get stats from timer service
    const response = await fetch(`${TIMER_SERVICE_URL}/api/timer/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Timer service responded with status: ${response.status}`)
    }

    const timerData = await response.json()
    
    // Get monitoring stats from Solana monitor service
    const monitorResponse = await fetch(`${process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'}/api/monitor/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    })

    let monitorData = null
    if (monitorResponse.ok) {
      monitorData = await monitorResponse.json()
    }

    // Combine stats from both services
    const stats = {
      timer: timerData.data,
      monitoring: monitorData?.data || null,
      services: {
        timerService: {
          status: response.ok ? 'healthy' : 'unhealthy',
          url: TIMER_SERVICE_URL
        },
        monitorService: {
          status: monitorResponse.ok ? 'healthy' : 'unhealthy',
          url: process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin statistics'
    }, { status: 500 })
  }
}