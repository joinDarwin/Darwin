'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Server,
  Database,
  Globe,
  Timer,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'

interface GlobalTimerState {
  startTime: number
  duration: number
  isActive: boolean
  lastSwapTime: number | null
  serverTime: number
}

interface AdminStats {
  timer: GlobalTimerState
  monitoring: {
    mode: string
    currentInterval: number
    currentCost: number
    minCost: number
    maxCost: number
    range: string
    lastTrade: string
    consecutiveErrors: number
  } | null
  services: {
    timerService: {
      status: string
      url: string
    }
    monitorService: {
      status: string
      url: string
    }
  }
}

interface HealthStatus {
  status: string
  timestamp: number
  instanceId: string
  services: {
    timer: {
      status: string
      url: string
      instanceId: string
      redisAvailable: boolean
    }
    monitor: {
      status: string
      url: string
      tokenAddress: string
      isMonitoring: boolean
      webhookMode: boolean
    }
    redis: {
      status: string
      url?: string
    }
    solana: {
      status: string
      endpoint: string
    }
  }
  environment: {
    nodeEnv: string
    redisAvailable: boolean
    heliusApiKey: boolean
    architecture: string
  }
}

export default function AdminPage() {
  const [timerState, setTimerState] = useState<GlobalTimerState | null>(null)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch timer state
  const fetchTimerState = async () => {
    try {
      const response = await fetch('/api/timer')
      const data = await response.json()
      if (data.success) {
        setTimerState(data.data)
      }
    } catch (error) {
      console.error('Error fetching timer state:', error)
    }
  }

  // Fetch admin stats
  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setAdminStats(data.data)
        setIsMonitoring(data.data.monitoring?.lastTrade ? true : false)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error('Error fetching health status:', error)
    }
  }

  // Manual timer reset
  const resetTimer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })
      const data = await response.json()
      if (data.success) {
        await fetchTimerState()
        await fetchAdminStats()
      }
    } catch (error) {
      console.error('Error resetting timer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle monitoring
  const toggleMonitoring = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isMonitoring })
      })
      const data = await response.json()
      if (data.success) {
        setIsMonitoring(!isMonitoring)
        await fetchAdminStats()
      }
    } catch (error) {
      console.error('Error toggling monitoring:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh all data
  const refreshAll = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchTimerState(),
      fetchAdminStats(),
      fetchHealthStatus()
    ])
    setIsLoading(false)
  }

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTimerState()
      fetchAdminStats()
    }, 5000)

    // Initial load
    refreshAll()

    return () => clearInterval(interval)
  }, [])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTimeLeft = () => {
    if (!timerState) return 0
    const elapsed = Date.now() - timerState.startTime
    return Math.max(0, timerState.duration - elapsed)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'unhealthy': return 'text-red-400'
      case 'degraded': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'default'
      case 'unhealthy': return 'destructive'
      case 'degraded': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
              <p className="text-gray-300">Separate Services Architecture - Real-time Monitoring</p>
            </div>
            <Button 
              onClick={refreshAll} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timer Status - Large Card */}
          <div className="lg:col-span-2">
            <Card className="border-white/20 p-6 bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <Timer className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Global Timer</h2>
              </div>
              
              {timerState && (
                <div className="space-y-6">
                  {/* Timer Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-2">
                      {formatTime(getTimeLeft())}
                    </div>
                    <Badge 
                      variant={timerState.isActive ? "default" : "secondary"}
                      className="text-lg px-4 py-2"
                    >
                      {timerState.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Timer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Started</div>
                      <div className="text-white font-medium">
                        {new Date(timerState.startTime).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Last Reset</div>
                      <div className="text-white font-medium">
                        {timerState.lastSwapTime 
                          ? new Date(timerState.lastSwapTime).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={resetTimer} 
                      disabled={isLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Timer
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* System Health */}
          <Card className="border-white/20 p-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">System Health</h2>
            </div>
            
            {healthStatus && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Overall Status</span>
                  <Badge variant={getStatusBadge(healthStatus.status)}>
                    {healthStatus.status}
                  </Badge>
                </div>
                
                <Separator className="bg-white/10" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Timer Service</span>
                    <Badge variant={getStatusBadge(healthStatus.services.timer.status)}>
                      {healthStatus.services.timer.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Monitor Service</span>
                    <Badge variant={getStatusBadge(healthStatus.services.monitor.status)}>
                      {healthStatus.services.monitor.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Redis</span>
                    <Badge variant={getStatusBadge(healthStatus.services.redis.status)}>
                      {healthStatus.services.redis.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Solana RPC</span>
                    <Badge variant={getStatusBadge(healthStatus.services.solana.status)}>
                      {healthStatus.services.solana.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Service Status */}
          <Card className="border-white/20 p-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Service Status</h2>
            </div>
            
            {adminStats?.services && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Timer Service</span>
                      <Badge variant={getStatusBadge(adminStats.services.timerService.status)}>
                        {adminStats.services.timerService.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {adminStats.services.timerService.url}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Monitor Service</span>
                      <Badge variant={getStatusBadge(adminStats.services.monitorService.status)}>
                        {adminStats.services.monitorService.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {adminStats.services.monitorService.url}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Monitoring Control */}
          <Card className="border-white/20 p-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Blockchain Monitoring</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status</span>
                <div className="flex items-center gap-2">
                  {isMonitoring ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <Badge variant={isMonitoring ? "default" : "destructive"}>
                    {isMonitoring ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
              
              {adminStats?.monitoring && (
                <>
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Polling Interval</span>
                      <span className="text-white">
                        {adminStats.monitoring.currentInterval}s
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Current Cost</span>
                      <span className="text-green-400 font-semibold">
                        {adminStats.monitoring.currentCost} credits/hour
                      </span>
                    </div>
                    
                    {adminStats.monitoring.lastTrade && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Last Trade</span>
                        <span className="text-sm text-gray-400">
                          {new Date(adminStats.monitoring.lastTrade).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    
                    {adminStats.monitoring.consecutiveErrors > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Consecutive Errors</span>
                        <Badge variant="destructive">
                          {adminStats.monitoring.consecutiveErrors}
                        </Badge>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <Button 
                onClick={toggleMonitoring} 
                disabled={isLoading}
                className="w-full"
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Monitoring
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Architecture Info */}
          <Card className="border-white/20 p-6 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Architecture</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Separate Services</span>
                </div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-400" />
                    Reduced Vercel resource usage
                  </li>
                  <li className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    Independent service scaling
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Better fault isolation
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Improved monitoring
                  </li>
                </ul>
              </div>
              
              {healthStatus && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Environment</span>
                    <span className="text-sm text-gray-400">
                      {healthStatus.environment.nodeEnv}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Instance ID</span>
                    <span className="text-sm text-gray-400">
                      {healthStatus.instanceId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Redis Available</span>
                    <Badge variant={healthStatus.environment.redisAvailable ? "default" : "secondary"}>
                      {healthStatus.environment.redisAvailable ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}