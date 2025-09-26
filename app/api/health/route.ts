import { NextResponse } from 'next/server'

const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3002'
const SOLANA_MONITOR_SERVICE_URL = process.env.SOLANA_MONITOR_SERVICE_URL || 'http://localhost:3001'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: Date.now(),
    instanceId: process.env.INSTANCE_ID || 'unknown',
    services: {
      timer: await checkTimerService(),
      monitor: await checkMonitorService(),
      redis: await checkRedis(),
      solana: await checkSolanaRPC()
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      redisAvailable: !!process.env.REDIS_URL,
      heliusApiKey: !!process.env.HELIUS_API_KEY,
      architecture: 'separate-services'
    }
  }

  // Determine overall health status
  const criticalServices = [health.services.timer, health.services.monitor]
  const allCriticalHealthy = criticalServices.every(service => service.status === 'healthy')
  health.status = allCriticalHealthy ? 'healthy' : 'degraded'

  const statusCode = allCriticalHealthy ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}

async function checkTimerService() {
  try {
    const response = await fetch(`${TIMER_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const data = await response.json()
      return {
        status: 'healthy',
        url: TIMER_SERVICE_URL,
        instanceId: data.instanceId,
        redisAvailable: data.redisAvailable
      }
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkMonitorService() {
  try {
    const response = await fetch(`${SOLANA_MONITOR_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })

    if (response.ok) {
      const data = await response.json()
      return {
        status: 'healthy',
        url: SOLANA_MONITOR_SERVICE_URL,
        tokenAddress: data.tokenAddress,
        isMonitoring: data.isMonitoring,
        webhookMode: data.webhookMode
      }
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkRedis() {
  try {
    // Try to import Redis to check if it's available
    const Redis = await import('ioredis').catch(() => null)
    
    if (!Redis || !process.env.REDIS_URL) {
      return {
        status: 'not_configured',
        message: 'Redis not configured, using in-memory storage'
      }
    }

    const redis = new Redis.default(process.env.REDIS_URL)
    await redis.ping()
    redis.disconnect()
    
    return {
      status: 'healthy',
      url: process.env.REDIS_URL.replace(/\/\/.*@/, '//***@') // Hide credentials
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function checkSolanaRPC() {
  try {
    const rpcUrl = process.env.HELIUS_API_KEY 
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
      : 'https://api.mainnet-beta.solana.com'
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (response.ok) {
      return {
        status: 'healthy',
        endpoint: rpcUrl.replace(/api-key=.*/, 'api-key=***')
      }
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}