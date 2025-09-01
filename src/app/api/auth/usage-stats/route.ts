import { NextRequest, NextResponse } from 'next/server'
import { AuthHelpers } from '@/lib/auth'
import { APIResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthHelpers.getCurrentUser()
    
    if (!user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const stats = await AuthHelpers.getUserUsageStats(user.id, 30)
    
    if (!stats) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to fetch usage statistics'
      }, { status: 500 })
    }

    return NextResponse.json<APIResponse<typeof stats>>({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Usage stats fetch error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}