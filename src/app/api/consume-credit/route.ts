import { NextRequest, NextResponse } from 'next/server'
import { AuthHelpers } from '@/lib/auth'
import { APIResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthHelpers.getCurrentUser()
    
    if (!user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { action } = await request.json()
    
    // Reset daily credits if needed
    await AuthHelpers.resetDailyCreditsIfNeeded(user.id)
    
    // Check if user has credits available
    const { hasCredits, remainingCredits, dailyRemaining } = await AuthHelpers.hasResearchCredits(user.id)
    
    if (!hasCredits) {
      const profile = await AuthHelpers.getUserProfile(user.id)
      
      let reason = 'No credits available'
      if (profile?.plan === 'free' && profile?.role !== 'ADMIN') {
        if (remainingCredits <= 0) {
          reason = 'Monthly credit limit reached. Upgrade to get more credits.'
        } else if (dailyRemaining <= 0) {
          reason = 'Daily credit limit reached. Try again tomorrow or upgrade for unlimited daily access.'
        }
      }
      
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: reason,
        data: null
      }, { status: 403 })
    }

    // Consume the credit
    const result = await AuthHelpers.consumeResearchCredit(user.id, action || 'scraping_transition')
    
    if (!result.success) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: result.reason || 'Failed to consume credit',
        data: null
      }, { status: 403 })
    }

    // Get updated credit info
    const updatedCredits = await AuthHelpers.hasResearchCredits(user.id)
    
    return NextResponse.json<APIResponse<any>>({
      success: true,
      data: {
        remainingCredits: updatedCredits.remainingCredits,
        dailyRemaining: updatedCredits.dailyRemaining,
        action: action || 'scraping_transition'
      },
      message: 'Credit consumed successfully'
    })

  } catch (error) {
    console.error('Credit consumption error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}