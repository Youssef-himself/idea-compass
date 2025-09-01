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

    const profile = await AuthHelpers.getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Profile not found'
      }, { status: 404 })
    }

    return NextResponse.json<APIResponse<typeof profile>>({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await AuthHelpers.getCurrentUser()
    
    if (!user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const updates = await request.json()
    
    // Only allow specific fields to be updated
    const allowedFields = ['full_name', 'avatar_url']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 })
    }

    const profile = await AuthHelpers.updateUserProfile(user.id, filteredUpdates)
    
    if (!profile) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to update profile'
      }, { status: 500 })
    }

    return NextResponse.json<APIResponse<typeof profile>>({
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}