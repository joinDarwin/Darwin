import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode } = body
    
    if (!mode || !['conservative', 'balanced', 'aggressive', 'ultra'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid polling mode' },
        { status: 400 }
      )
    }
    
    // In the separate services architecture, polling speed is handled
    // by the Solana monitor service and cannot be changed dynamically
    // This endpoint now returns a message explaining the limitation
    
    return NextResponse.json({
      success: false,
      error: 'Polling speed changes require service restart in the separate services architecture. The Solana monitor service uses a fixed 3-second polling interval.',
      currentMode: 'balanced',
      availableModes: ['conservative', 'balanced', 'aggressive', 'ultra'],
      note: 'To change polling speed, modify the service configuration and restart the Solana monitor service.'
    })
  } catch (error) {
    console.error('Error setting polling speed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set polling speed' },
      { status: 500 }
    )
  }
}
