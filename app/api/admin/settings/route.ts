import { NextRequest, NextResponse } from 'next/server'

const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3002'
const SOLANA_MONITOR_SERVICE_URL = process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Get current settings from environment and services
    const settings = {
      tokenAddress: process.env.TOKEN_ADDRESS || '9VxExA1iRPbuLLdSJ2rB3nyBxsyLReT4aqzZBMaBaY1p',
      timerDuration: parseInt(process.env.TIMER_DEFAULT_DURATION || '600000') / 1000, // Convert to seconds
      pollingInterval: 3, // Default polling interval
      isMonitoring: true, // Default to monitoring enabled
      heliusApiKey: process.env.HELIUS_API_KEY ? '***configured***' : 'not configured',
      webhookMode: process.env.HELIUS_WEBHOOK_MODE === 'true',
      services: {
        timerService: {
          url: TIMER_SERVICE_URL,
          status: 'running'
        },
        monitorService: {
          url: SOLANA_MONITOR_SERVICE_URL,
          status: 'running'
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For the separate services architecture, we can only update monitoring status
    // Other settings require environment variable changes and service restarts
    
    if (typeof body.isMonitoring === 'boolean') {
      const action = body.isMonitoring ? 'start' : 'stop'
      
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
        data: { isMonitoring: body.isMonitoring },
        message: `Monitoring ${body.isMonitoring ? 'enabled' : 'disabled'} successfully`
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Only monitoring status can be updated. Other settings require environment variable changes and service restarts.'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}