import { NextRequest } from 'next/server'

// External service URLs - these should be set in environment variables
const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId') || 'anonymous'

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
      let pingInterval: NodeJS.Timeout | null = null
      
      try {
        // Get initial state from timer service
        const response = await fetch(`${TIMER_SERVICE_URL}/api/timer/state`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
          const initialState = await response.json()
          const initialData = `data: ${JSON.stringify({
            type: 'initial',
            data: initialState.data,
            clientId
          })}\n\n`
          controller.enqueue(encoder.encode(initialData))
        }

        // Connect to timer service SSE stream using fetch
        const sseResponse = await fetch(`${TIMER_SERVICE_URL}/api/timer/stream`, {
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        })

        if (!sseResponse.ok) {
          throw new Error(`Timer service SSE responded with status: ${sseResponse.status}`)
        }

        reader = sseResponse.body?.getReader() || null
        if (!reader) {
          throw new Error('No reader available from timer service SSE')
        }

        // Read SSE stream
        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              
              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const message = JSON.parse(line.slice(6))
                    const data = `data: ${JSON.stringify({
                      ...message,
                      clientId,
                      timestamp: Date.now()
                    })}\n\n`
                    controller.enqueue(encoder.encode(data))
                  } catch (error) {
                    console.error('Error parsing SSE message:', error)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading SSE stream:', error)
            const errorData = `data: ${JSON.stringify({
              type: 'error',
              message: 'Connection to timer service lost',
              clientId,
              timestamp: Date.now()
            })}\n\n`
            controller.enqueue(encoder.encode(errorData))
          }
        }

        readStream()

        // Keep connection alive with periodic pings
        pingInterval = setInterval(() => {
          const ping = `data: ${JSON.stringify({
            type: 'ping',
            timestamp: Date.now()
          })}\n\n`
          controller.enqueue(encoder.encode(ping))
        }, 30000)

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          if (reader) {
            reader.cancel()
          }
          if (pingInterval) {
            clearInterval(pingInterval)
          }
          try {
            if (controller.desiredSize !== null) {
              controller.close()
            }
          } catch (error) {
            // Controller might already be closed, ignore the error
            console.log('Controller already closed or error closing:', error)
          }
        })
      } catch (error) {
        console.error('Error in WebSocket stream:', error)
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}